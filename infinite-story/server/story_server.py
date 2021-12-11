from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from database import DB
from story import utils
from story.story_manager import UnconstrainedStoryManager, Action, ACT_DO, ACT_SAY
from inference.tasks import generate as generate_remote
from nlp.tasks import find_locations as find_locations_remote
from nlp.tasks import get_pos as get_pos_remote
from partyprocessor.tasks import process_action as process_action_remote, VOTE_TIME, READ_TIME, get_delay, DEFAULT_PROPOSALS, DEFAULT_PROPOSALS_NO_ACT
import yaml
import logging
import traceback
import random
import math
import time
from story import grammars


app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

db = None
with open(utils.YAML_FILE, "r") as stream:
    data = yaml.safe_load(stream)


theme = "fantasy"
MAX_PARTY_MODE_PLAYERS = 10
GOLD_PER_ACHIEVEMENT = 20


@app.before_first_request
def prepare():
    global db
    db = DB()


def generate(text):
    r = generate_remote.delay(text)
    res = r.get(timeout=90)
    return res


def capitalize(text):
    if len(text) < 1:
        return text
    if len(text) == 1:
        return text[0].upper()
    else:
        return text[0].upper() + text[1:]


def build_generate(postprocess_dic):
    def gen(text):
        res = generate(text)
        if res is not False:
            for k in postprocess_dic.keys():
                res = res.replace(k, postprocess_dic[k])
                res = res.replace(capitalize(k), postprocess_dic[k])
        return res
    return gen


def find_locations(text):
    r = find_locations_remote.delay(text)
    locations = r.get(timeout=5)
    return locations

def get_pos(text):
    r = get_pos_remote.delay(text)
    pos = r.get(timeout=5)
    return pos

def process_action(code, device_id, action):
    a = process_action_remote.delay(code, device_id, action)
    a.get(timeout=5)
    

@app.route("/", methods=["GET"])
@cross_origin()
def index():
    return "hi there. this is the api of The Infinite Story 🔥"


@app.route("/get_pos", methods=["POST"])
@cross_origin()
def get_pos_call():
    try:
        req_data = request.get_json()
        text = req_data["text"]
        pos = get_pos(text)
        return jsonify({"pos": pos})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/signup", methods=["POST"])
@cross_origin()
def signup():
    try:
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        device_id = req_data["deviceId"]
        platform = req_data["platform"]
        db.signup(device_id, platform)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/use_discord_code", methods=["POST"])
@cross_origin()
def use_discord_code():
    try:
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        code = req_data["code"]
        device_id = req_data["device_id"]
        try:
            db.link_user_with_discord(device_id=device_id, code=code)
        except Exception as e:
            return jsonify({"error": "This code is invalid"}), 400
        db.add_achievements(device_id=device_id, achievements=["discord"])
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/discord_link", methods=["POST"])
@cross_origin()
def discord_link():
    try:
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        discord_id = req_data["discord_id"]
        code = db.create_discord_link(discord_id)
        return jsonify({"code": code})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/create_offer", methods=["POST"])
@cross_origin()
def create_offer():
    try:
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        offer_type = req_data["offer_type"]
        offer = req_data["offer"]
        code = db.create_offer(offer, offer_type)
        return jsonify({"code": code})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/redeem_offer", methods=["POST"])
@cross_origin()
def redeem_offer():
    try:
        app.logger.info("Redeeming offer...")
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        code = req_data["code"]
        device_id = req_data["device_id"]
        try:
            db.redeem_offer(device_id=device_id, code=code)
        except Exception as e:
            app.logger.error(e)
            return jsonify({"error": str(e)}), 400
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/prompt", methods=["POST"])
@cross_origin()
def prompt():
    try:
        req_data = request.get_json()
        # app.logger.info("Req:")
        # app.logger.info(req_data)
        context = req_data["context"]
        title = req_data["title"]
        advanced = req_data.get("advanced", {})
        device_id = req_data["deviceId"]
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        if db.get_user(device_id) == None:
            return jsonify({"error": "User does not exist"}), 401
        prompt = db.create_prompt(context, title, device_id, advanced)
        return jsonify({"uid": prompt.id, "title": prompt.title, "context": prompt.context, "public": prompt.public, "author": "You", "code": prompt.code, "advanced": prompt.advanced})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/import_prompt", methods=["POST"])
@cross_origin()
def import_prompt():
    try:
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        code = req_data["code"]
        device_id = req_data["deviceId"]
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        if db.get_user(device_id) == None:
            return jsonify({"error": "User does not exist"}), 401
        db.import_from_code(device_id, code)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/prompts/<device_id>", methods=["GET"])
@cross_origin()
def get_prompts(device_id):
    try:
        app.logger.info(f"Getting prompts for device_id {device_id}")
        prompts = db.get_prompts(device_id)
        prompts_serialized = []
        for p in prompts:
            nick = "You" if p.author_id == p.user_id else db.get_user_from_id(
                p.author_id).nickname
            pp = {
                "uid": p.id,
                "title": p.title,
                "context": p.context,
                "advanced": p.advanced,
                "public": p.public,
                "author": nick if nick else "Anonymous",
                "code": p.code,
                "createdAt": p.created_date,
                "updatedAt": p.updated_date
            }
            prompts_serialized.append(pp)
        return jsonify({"prompts": prompts_serialized})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/prompt/<uid>", methods=["PUT"])
@cross_origin()
def update_prompt(uid):
    try:
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        app.logger.info(f"Updating prompt {uid}")
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        user = db.get_user_of_prompt(uid)
        if user.device_id != request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        prompt = db.update_prompt_properties(uid, req_data)
        return jsonify({"uid": prompt.id, "title": prompt.title, "context": prompt.context, "public": prompt.public, "author": "You", "code": prompt.code, "advanced": prompt.advanced})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/prompt/<uid>", methods=["DELETE"])
@cross_origin()
def delete_prompt(uid):
    try:
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        app.logger.info(f"Deleting prompt {uid}")
        try:
            user = db.get_user_of_prompt(uid)
            if user.device_id != request.headers.get('Authorization'):
                return jsonify({"error": "Not authorized"}), 401
        except:
            return jsonify({"error": "Not authorized"}), 401
        db.delete_prompt(uid)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/start_story", methods=["POST"])
@cross_origin()
def start_story():
    try:
        theme_config = data["settings"][theme]
        postprocess_dic = theme_config["postprocess"]
        generate_replace = build_generate(postprocess_dic)
        manager = UnconstrainedStoryManager(
            {"generate": generate_replace, "find_locations": find_locations}
        )
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        name_token = "<NAME>"
        device_id = req_data["deviceId"]
        promptId = req_data.get("promptId", None)
        mpitem_id = req_data.get("marketplaceItemId", None)
        if mpitem_id:
            mp = db.get_marketplace_item(mpitem_id)
            mpclass = mp.item["item"]
            context = mpclass["context"]

            if mpclass["location"] == "???":
                # Simple mode. 1 prompt, no grammar, no origin
                context = mpclass["context"]
                if name_token in context:
                    story_name = req_data["name"].strip()
                    context = context.replace(name_token, story_name)
                prompt = mpclass["prompts"][0]
                if name_token in prompt:
                    story_name = req_data["name"].strip()
                    prompt = prompt.replace(name_token, story_name)

                s, error = manager.start_new_story(prompt, context, {})
                if error is not False:
                    return jsonify({"error": error})
                story = db.create_story(s, device_id=device_id, title=mpclass["name"])
            else:
                # Complex mode
                # TODO: Grammar 
                context = mpclass["context"] + "\n\n"
                if name_token in context:
                    story_name = req_data["name"].strip()
                    context = context.replace(name_token, story_name)
                prompt = mpclass["prompts"][math.floor(random.random() * len(mpclass["prompts"]))]
                if name_token in prompt:
                    story_name = req_data["name"].strip()
                    prompt = prompt.replace(name_token, story_name)
                origin = {
                    "class": mpclass["name"],
                    "location": mpclass["location"],
                    "portrait": mpclass["portrait"],
                }
                if req_data.get("name", False):
                    origin["name"] = req_data["name"].strip()
                s, error = manager.start_new_story(prompt, context, origin)
                if error is not False:
                    return jsonify({"error": error})
                story = db.create_story(s, device_id=device_id, title=utils.make_default_title_from_origin(origin))
            db.increment_mpitem_used_time(mp.id)

        elif promptId:
            prompt = db.get_prompt(promptId)
            if prompt.advanced.get("name", False):
                context = prompt.context + "\n\n"
                if name_token in context:
                    story_name = req_data["name"].strip()
                    context = context.replace(name_token, story_name)
                promptText = prompt.advanced["prompts"][math.floor(random.random() * len(prompt.advanced["prompts"]))]
                if name_token in promptText:
                    story_name = req_data["name"].strip()
                    promptText = promptText.replace(name_token, story_name)
                origin = {
                    "class": prompt.advanced["name"],
                    "location": prompt.advanced["location"],
                    "portrait": prompt.advanced["portrait"],
                }
                if req_data.get("name", False):
                    origin["name"] = req_data["name"].strip()
                s, error = manager.start_new_story(promptText, context, origin)
                if error is not False:
                    return jsonify({"error": error})
                story = db.create_story(s, device_id=device_id, title=utils.make_default_title_from_origin(origin))
            else:
                last_dot = prompt.context.rfind('.')
                last_ex = prompt.context.rfind('!')
                last_q = prompt.context.rfind('?')
                last_punc = last_dot
                if last_ex > last_punc:
                    last_punc = last_ex
                if last_q > last_punc:
                    last_punc = last_q

                if last_punc == -1:
                    context = prompt.context
                    promptText = "\n\n"
                else:
                    context = prompt.context[:last_punc+1] + "\n\n"
                    promptText = prompt.context[last_punc+2:].strip()

                if name_token in context:
                    story_name = req_data["name"].strip()
                    context = context.replace(name_token, story_name)
                if name_token in promptText:
                    story_name = req_data["name"].strip()
                    promptText = promptText.replace(name_token, story_name)
                s, error = manager.start_new_story(promptText, context, {})
                if error is not False:
                    return jsonify({"error": error})
                story = db.create_story(s, device_id=device_id, title=prompt.title)
        else:
            story_class = req_data["playerClass"]
            if story_class is None:
                story_class = 0
            story_name = req_data["name"].strip()
            # Generate the prompt
            # Todo refactor all this into a function that builds up the context and the prompt
            character_key = story_class
            character = theme_config["classes"][character_key]
            if character.get("has_grammar", False):
                context = grammars.generate(
                    theme, character_key, "context") + "\n\n"
                context = context.replace(name_token, story_name)
                prompt = grammars.generate(theme, character_key, "prompt")
                prompt = prompt.replace(name_token, story_name)
                origin = {"name": story_name,
                          "class": character_key, "location": character["location"]}
            else:
                context = character["context"] + "\n\n"
                context = context.replace(name_token, story_name)
                if character.get("prompts", False):
                    stories = db.get_db_stories(device_id)
                    stories_serialized = []
                    for s in stories:
                        ss = {
                         "uid": s.id,
                         "origin": s.origin,
                         "title": s.title,
                         "public": s.public,
                         "createdAt": s.created_date,
                         "updatedAt": s.updated_date
                        }
                        stories_serialized.append(ss)
                    number_of_stories_with_this_character_key = len(list(filter(lambda s: s["origin"].get("class", False) == character_key, stories_serialized)))
                    prompt =  character["prompts"][number_of_stories_with_this_character_key % len(character["prompts"])]
                else:
                    prompt = character["prompt"]
                origin = {"name": story_name,
                          "class": character_key, "location": character["location"]}
            s, error = manager.start_new_story(prompt, context, origin)
            if error is not False:
                return jsonify({"error": error})

            story = db.create_story(
                s, device_id=device_id, title=utils.make_default_title_from_origin(origin))
        storybits = s.to_storybits()
        return jsonify({"uid": story.id, "storyBits": storybits, "title": story.title})
    except Exception as e:
        app.logger.error(str(e))
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 400


@app.route("/act", methods=["POST"])
@cross_origin()
def act():
    try:
        # TODO: Keyword injector
        theme_config = data["settings"][theme]
        postprocess_dic = theme_config["postprocess"]
        generate_replace = build_generate(postprocess_dic)
        manager = UnconstrainedStoryManager(
            {"generate": generate_replace, "find_locations": find_locations}
        )
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        uid = req_data["uid"]
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        user = db.get_user_of_story(uid)
        if user.device_id != request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        db_response = db.get_story(uid)
        manager.set_story(db_response["story"])
        action_type = req_data["type"]
        app.logger.info(f"Type: {action_type}")
        action_payload = req_data["payload"]
        if (action_type != ACT_SAY) and (action_type != ACT_DO):
            amount
        action = Action(action_type, action_payload)
        user = db.get_user_of_story(uid)
        error, new_storybits, new_achievements = manager.act(action, user)
        if len(new_achievements) > 0:
            db.add_achievements(device_id=user.device_id,
                                achievements=new_achievements)
            db.add_gold(user.device_id, len(new_achievements) * GOLD_PER_ACHIEVEMENT)
        if error is not False:
            return jsonify({"error": error})
        else:
            db.update_story(uid, manager.story)
            return jsonify({"newStoryBits": new_storybits})
    except Exception as e:
        app.logger.error(str(e))
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 400


@app.route("/start_party_game", methods=["POST"])
@cross_origin()
def start_party_game():
    try:
        theme_config = data["settings"][theme]
        postprocess_dic = theme_config["postprocess"]
        generate_replace = build_generate(postprocess_dic)
        manager = UnconstrainedStoryManager(
            {"generate": generate_replace, "find_locations": find_locations}
        )
        req_data = request.get_json()
        name_token = "<NAME>"
        app.logger.info("Req:")
        app.logger.info(req_data)
        device_id = req_data["deviceId"]
        promptId = req_data.get("promptId", None)
        mpitem_id = req_data.get("marketplaceItemId", None)
        if mpitem_id:
            mp = db.get_marketplace_item(mpitem_id)
            mpclass = mp.item["item"]

            if mpclass["portrait"] == "creative":
                # Simple mode. 1 prompt, no grammar, no origin
                context = mpclass["context"]
                if name_token in context:
                    story_name = req_data["name"].strip()
                    context = context.replace(name_token, story_name) 
                prompt = mpclass["prompts"][0]
                if name_token in prompt:
                    story_name = req_data["name"].strip()
                    prompt = prompt.replace(name_token, story_name)

                s, error = manager.start_new_story(prompt, context, {})
                if error is not False:
                    return jsonify({"error": error})
                title = mpclass["name"]
            else:
                # Complex mode
                # TODO: Grammar 
                context = mpclass["context"] + "\n\n"
                if name_token in context:
                    story_name = req_data["name"].strip()
                    context = context.replace(name_token, story_name)
                prompt = mpclass["prompts"][math.floor(random.random() * len(mpclass["prompts"]))]
                if name_token in prompt:
                    story_name = req_data["name"].strip()
                    prompt = prompt.replace(name_token, story_name)
                origin = {
                    "class": mpclass["name"],
                    "location": mpclass["location"],
                    "portrait": mpclass["portrait"],
                }
                if req_data.get("name", False):
                    origin["name"] = req_data["name"].strip()
                s, error = manager.start_new_story(prompt, context, origin)
                if error is not False:
                    return jsonify({"error": error})
                title = utils.make_default_title_from_origin(origin)
            db.increment_mpitem_used_time(mp.id)
        elif promptId:
            prompt = db.get_prompt(promptId)
            if prompt.advanced.get("name", False):
                context = prompt.context + "\n\n"
                if name_token in context:
                    story_name = req_data["name"].strip()
                    context = context.replace(name_token, story_name)
                promptText = prompt.advanced["prompts"][math.floor(random.random() * len(prompt.advanced["prompts"]))]
                if name_token in promptText:
                    story_name = req_data["name"].strip()
                    promptText = promptText.replace(name_token, story_name)
                origin = {
                    "class": prompt.advanced["name"],
                    "location": prompt.advanced["location"],
                    "portrait": prompt.advanced["portrait"],
                }
                if req_data.get("name", False):
                    origin["name"] = req_data["name"].strip()
                s, error = manager.start_new_story(promptText, context, origin)
                if error is not False:
                    return jsonify({"error": error})
                title = utils.make_default_title_from_origin(origin)
            else:
                last_dot = prompt.context.rfind('.')
                last_ex = prompt.context.rfind('!')
                last_q = prompt.context.rfind('?')
                last_punc = last_dot
                if last_ex > last_punc:
                    last_punc = last_ex
                if last_q > last_punc:
                    last_punc = last_q
                if last_punc == -1:
                    context = prompt.context
                    promptText = "\n\n"
                else:
                    context = prompt.context[:last_punc+1] + "\n\n"
                    promptText = prompt.context[last_punc+2:].strip()
                if name_token in context:
                    story_name = req_data["name"].strip()
                    context = context.replace(name_token, story_name)
                if name_token in promptText:
                    story_name = req_data["name"].strip()
                    promptText = promptText.replace(name_token, story_name)
                s, error = manager.start_new_story(promptText, context, {})
                if error is not False:
                    return jsonify({"error": error})
                title = prompt.title
        else:
            story_class = req_data["playerClass"]
            if story_class is None:
                story_class = 0
            story_name = req_data["name"].strip()
            # Generate the prompt
            # Todo refactor all this into a function that builds up the context and the prompt
            character_key = story_class
            name_token = "<NAME>"
            character = theme_config["classes"][character_key]
            if character.get("has_grammar", False):
                context = grammars.generate(
                    theme, character_key, "context") + "\n\n"
                context = context.replace(name_token, story_name)
                prompt = grammars.generate(theme, character_key, "prompt")
                prompt = prompt.replace(name_token, story_name)
                origin = {"name": story_name,
                          "class": character_key, "location": character["location"]}
            else:
                context = character["context"] + "\n\n"
                context = context.replace(name_token, story_name)
                if character.get("prompts", False):
                    stories = db.get_db_stories(device_id)
                    stories_serialized = []
                    for s in stories:
                        ss = {
                         "uid": s.id,
                         "origin": s.origin,
                         "title": s.title,
                         "public": s.public,
                         "createdAt": s.created_date,
                         "updatedAt": s.updated_date
                        }
                        stories_serialized.append(ss)
                    number_of_stories_with_this_character_key = len(list(filter(lambda s: s["origin"].get("class", False) == character_key, stories_serialized)))
                    prompt =  character["prompts"][number_of_stories_with_this_character_key % len(character["prompts"])]
                else:
                    prompt = character["prompt"]
                origin = {"name": story_name,
                          "class": character_key, "location": character["location"]}
            s, error = manager.start_new_story(prompt, context, origin)
            if error is not False:
                return jsonify({"error": error})
            title = utils.make_default_title_from_origin(origin)
        code = db.create_party_game(device_id, s, title)
        return jsonify({"code": code})
    except Exception as e:
        app.logger.error(str(e))
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 400

@app.route("/test_party_game", methods=["POST"])
@cross_origin()
def test_party_game():
    try:
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        code = req_data["code"]
        p = db.get_party_game(code)
        if p is False:
            return jsonify({"exists": False, "bannedPlayers": []})
        elif len(p["players"]) >= MAX_PARTY_MODE_PLAYERS:
            return jsonify({"exists": True, "full": True})
        else:
            return jsonify({"exists": True, "bannedPlayers": p["bannedPlayers"]})

    except Exception as e:
        app.logger.error(str(e))
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 400

@app.route("/join_party_game", methods=["POST"])
@cross_origin()
def join_party_game():
    try:
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        code = req_data["code"]
        device_id = req_data["deviceId"]
        profile_pic = req_data["profilePic"]
        # get user
        user = db.get_user(device_id)
        # open the party game in the db
        p = db.get_party_game(code)
        if p is False:
            return jsonify({"error": "This game doesn't exist"}), 400
        # add player to list of players
        p["players"][device_id] = {
                "nickname": user.nickname,
                "profilePic": profile_pic,
                "status": user.status,
                "lastPing": int(round(time.time() * 1000))
                } 
        if not p["votingStats"].get(device_id, False):
            p["votingStats"][device_id] = 0
        if not p["achievementsStats"].get(device_id, False):
            p["achievementsStats"][device_id] = []
        if not p["luckStats"].get(device_id, False):
            p["luckStats"][device_id] = 0
        # save and broadcast state
        db.broadcast_message_to_party_game(code, user.nickname + " joined the game")
        db.save_and_broadcast_party_game(code, p)
        # return state
        return jsonify(p)
    except Exception as e:
        app.logger.error(str(e))
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 400
# save and broadcast state
# return state to the client


@app.route("/action_party_game", methods=["POST"])
@cross_origin()
def action_party_game():
    try:
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        code = req_data["code"]
        device_id = req_data["deviceId"]
        action = req_data["action"]
        process_action(code, device_id, action)

        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 400

@app.route("/act_party_game", methods=["POST"])
@cross_origin()
def act_party_game():
    try:
        theme_config = data["settings"][theme]
        postprocess_dic = theme_config["postprocess"]
        generate_replace = build_generate(postprocess_dic)
        manager = UnconstrainedStoryManager(
            {"generate": generate_replace, "find_locations": find_locations}
        )
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        code = req_data["code"]
        db_response = db.get_party_game_story(code)
        manager.set_story(db_response)

        # Get the proposal with the most amount of vote and execute it 
        p = db.get_party_game(code)
        if p["currentState"] != "RESULT":
            return jsonify({"error": "PartyGame not in Result State"})

        proposals_sorted = sorted(p["proposals"], key=lambda pp: len(pp["votes"]))
        most_popular_proposal = proposals_sorted[-1]

        action_type = most_popular_proposal["proposal"]["type"]
        action_payload = most_popular_proposal["proposal"].get("payload", None)

        if action_type == "TELL_ME_MORE":
            action_type = ACT_DO
            action_payload = ""

        app.logger.info(f"Type: {action_type}")
        if (action_type != ACT_SAY) and (action_type != ACT_DO) and (action_type != "ROLLBACK"):
            app.logger.warning("WARNING: action_type not in [ACT_SAY, ACT_DO, ROLLBACK]")

        error = False
        if action_type == "ROLLBACK":
            story = manager.story
            latest_act = -1
            for i, s in enumerate(story.to_storybits()):
                if (s["type"] == ACT_DO) or (s["type"] == ACT_SAY):
                    latest_act = i
            if latest_act == -1:
                app.logger.warning("latest_act is -1, this will break")

            index = latest_act - 1 
            app.logger.info("Rolling back party game to index " + str(index))
            index -= 2
            # then we need to loop over the different results
            result_index = -1
            while index > 0:
                # remove the action
                result_index += 1
                index -= 1
                index -= len(story.results[result_index])
            story.actions = story.actions[:result_index+1]
            story.results = story.results[:result_index+1]
            manager.story = story
        else:
            action = Action(action_type, action_payload)
            user = db.get_user(p["owner"])
            # Add some metadata to the action if not executed by the SYSTEM
            if most_popular_proposal["user"] != "SYSTEM":
                proposer = db.get_user(most_popular_proposal["user"])
                metadata = {
                        "proposer": {
                            "nickname": proposer.nickname,
                            "status": proposer.status,
                            "votes": len(most_popular_proposal["votes"])
                            }
                        }
                action = Action(action_type, action_payload, metadata=metadata)
            user = db.get_user(p["owner"])
            error_m, new_storybits, new_achievements = manager.act(action, user)
            if error_m:
                error = True
        if error is not False:
            p["currentState"] = "VOTING"
            p["untilNextState"] = get_delay(VOTE_TIME * 1000)
            db.broadcast_message_to_party_game(code, "ERROR: The AI is confused. Choose another action or rollback")
        else:
            p["storyBits"] = list(reversed(manager.story.to_storybits()))
            p["storySerialized"] = manager.story.to_dict()
            p["currentState"] = "READING"
            if len(list(filter(lambda sb: "ACT" in sb["type"], p["storyBits"]))) > 0:
                p["proposals"] = DEFAULT_PROPOSALS
            else:
                p["proposals"] = DEFAULT_PROPOSALS_NO_ACT
            p["untilNextState"] = get_delay(READ_TIME * 1000)

        db.save_and_broadcast_party_game(code, p)
        # Now sync (or create) the single player story for all players
        complete_list_of_players = list(map(lambda pl: p["players"][pl]["nickname"], p["players"]))
        for player in p["players"]:
            db.create_or_sync_party_game_story(player, p["players"][player]["profilePic"], complete_list_of_players, code, manager.story, p["title"])
        return jsonify({"ok": "ok"})

    except Exception as e:
        app.logger.error(str(e))
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 400

@app.route("/rollback", methods=["POST"])
@cross_origin()
def rollback():
    try:
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        uid = req_data["uid"]
        index = req_data["index"]
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        user = db.get_user_of_story(uid)
        if user.device_id != request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        db_response = db.get_story(uid)
        story = db_response["story"]
        # We need to compute the acutal index from the story bit index
        # First we remove two (for the origin and the story start)
        index -= 2
        # then we need to loop over the different results
        result_index = -1
        while index > 0:
            # remove the action
            result_index += 1
            index -= 1
            index -= len(story.results[result_index])
        story.actions = story.actions[:result_index+1]
        story.results = story.results[:result_index+1]
        db.update_story(uid, story)
        return jsonify({"storyBits": story.to_storybits()})
    except Exception as e:
        app.logger.error(str(e))
        app.logger.exception(e)
        return jsonify({"error": str(e)}), 400


@app.route("/story/<uid>", methods=["GET"])
@cross_origin()
def get_story(uid):
    try:
        app.logger.info(f"Getting story {uid}")
        db_response = db.get_story(uid)
        if db_response["public"]:
            return jsonify({"storyBits": db_response["story"].to_storybits()})
        else:
            if not request.headers.get('Authorization'):
                return jsonify({"error": "Not authorized"}), 401
            user = db.get_user_of_story(uid)
            if user.device_id != request.headers.get('Authorization'):
                return jsonify({"error": "Not authorized"}), 401
            return jsonify({"storyBits": db_response["story"].to_storybits()})

    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/story/<uid>", methods=["PUT"])
@cross_origin()
def update_story(uid):
    try:
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        app.logger.info(f"Updating story {uid}")
        req_data = request.get_json()
        app.logger.info("Req:")
        app.logger.info(req_data)
        user = db.get_user_of_story(uid)
        if user.device_id != request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        db.update_story_properties(uid, req_data)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/story/<uid>", methods=["DELETE"])
@cross_origin()
def delete_story(uid):
    try:
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        app.logger.info(f"Deleting story {uid}")
        try:
            user = db.get_user_of_story(uid)
            if user.device_id != request.headers.get('Authorization'):
                return jsonify({"error": "Not authorized"}), 401
        except:
            return jsonify({"error": "Not authorized"}), 401
        db.delete_story(uid)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/user/<device_id>", methods=["GET"])
@cross_origin()
def get_user(device_id):
    try:
        app.logger.info(f"Getting user {device_id}")
        user = db.get_user(device_id)
        return jsonify({"achievements": user.achievements, "nickname": user.nickname,
            "status": user.status, "multiplayerAchievements": user.multiplayer_achievements, "gold": user.gold})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/user/<device_id>", methods=["POST"])
@cross_origin()
def change_user(device_id):
    try:
        app.logger.info(f"Changing user {device_id}")
        req_data = request.get_json()
        nickname = req_data.get("nickname", None)
        db.change_user(device_id, nickname)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/user/<device_id>/gold", methods=["POST"])
@cross_origin()
def get_gold(device_id):
    try:
        req_data = request.get_json()
        amount = req_data.get("amount", None)
        app.logger.info(f"Adding gold to user {device_id}, amount = {amount}")
        db.add_gold(device_id, amount)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/stories/<device_id>", methods=["GET"])
@cross_origin()
def get_stories(device_id):
    try:
        app.logger.info(f"Getting stories for device_id {device_id}")
        stories = db.get_db_stories(device_id)
        stories_serialized = []
        for s in stories:
            ss = {
                "uid": s.id,
                "origin": s.origin,
                "title": s.title,
                "metadata": s.story_metadata,
                "public": s.public,
                "createdAt": s.created_date,
                "updatedAt": s.updated_date
            }
            stories_serialized.append(ss)
        return jsonify({"stories": stories_serialized})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


# Marketplace stuff
@app.route("/get_all_marketplace_items", methods=["POST"])
@cross_origin()
def get_all_marketplace_items():
    try:
        app.logger.info(f"Getting all marketplace items")
        req_data = request.get_json()
        tag = req_data.get("tag", None)
        mpitems = db.get_all_marketplace_items(tag)
        mpitems_serialized = []
        for mp in mpitems:
            mpp = {
                "id": mp.id,
                "item": mp.item,
                "price": mp.price,
                "usedAllTime": mp.used_all_time,
                "usedLastWeek": mp.used_last_week,
                "boughtAllTime": mp.bought_all_time,
                "author": {
                    "nickname": mp.author.nickname,
                    "status": mp.author.status,
                    "deviceId": mp.author.device_id
                },
                "tags": mp.tags.split(':'),
                "createdAt": mp.created_date,
            }
            mpitems_serialized.append(mpp)
        return jsonify({"marketplaceItems": mpitems_serialized})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/get_marketplace_items", methods=["POST"])
@cross_origin()
def get_marketplace_items():
    try:
        app.logger.info(f"Getting batch marketplace items")
        req_data = request.get_json()
        app.logger.info(req_data)
        ids = req_data["ids"] 
        mpitems_serialized = []
        for i in ids:
            mp = db.get_marketplace_item(i)
            mpp = {
                "id": mp.id,
                "item": mp.item,
                "price": mp.price,
                "usedAllTime": mp.used_all_time,
                "usedLastWeek": mp.used_last_week,
                "boughtAllTime": mp.bought_all_time,
                "author": {
                    "nickname": mp.author.nickname,
                    "status": mp.author.status,
                    "deviceId": mp.author.device_id
                },
                "tags": mp.tags.split(':'),
                "createdAt": mp.created_date,
            }
            mpitems_serialized.append(mpp)
        return jsonify({"marketplaceItems": mpitems_serialized})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/add_class_to_shop", methods=["POST"])
@cross_origin()
def add_class_to_shop():
    try:
        app.logger.info(f"Add class to shop")
        req_data = request.get_json()
        app.logger.info(req_data)
        prompt_id = req_data["promptId"]
        tags_array = req_data["tags"]
        tags = ':'.join(list(sorted(tags_array)))
        prompt = db.get_prompt(prompt_id)
        if prompt.advanced != None and prompt.advanced.get("prompts", False) is not False:
            db.add_marketplace_item(
                    author_id=prompt.author.id,
                    price=req_data["price"],
                    item={
                        "type": "CLASS",
                        "item": {
                            "portrait": prompt.advanced["portrait"],
                            "location": prompt.advanced["location"],
                            "name": prompt.title,
                            "description": prompt.advanced["description"],
                            "context": prompt.context,
                            "prompts": prompt.advanced["prompts"],
                            "grammar": None,
                            "keywordInjecter": None
                        }
                    },
                tags=tags
            )
        else:
            last_dot = prompt.context.find('.')
            last_ex = prompt.context.find('!')
            last_q = prompt.context.find('?')
            last_punc = last_dot
            if last_ex != -1 and last_ex < last_punc:
                last_punc = last_ex
            if last_q != -1 and last_q < last_punc:
                last_punc = last_q
            context = prompt.context[:last_punc+1] + "\n\n"
            promptText = prompt.context[last_punc+2:].strip()

            db.add_marketplace_item(
                    author_id=prompt.author.id,
                    price=req_data["price"],
                    item={
                        "type": "CLASS",
                        "item": {
                            "portrait": "creative",
                            "location": "???",
                            "name": prompt.title,
                            "description": "Not created with advanced mode",
                            "context": context,
                            "prompts": [promptText],
                            "grammar": None,
                            "keywordInjecter": None
                        }
                    },
                tags=tags
            )
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/buy_marketplace_item", methods=["POST"])
@cross_origin()
def buy_marketplace_item():
    try:
        app.logger.info(f"buy_marketplace_item")
        req_data = request.get_json()
        app.logger.info(req_data)
        mpitem_id = req_data["id"]
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        else:
            device_id = request.headers.get('Authorization')
        mpitem = db.get_marketplace_item(mpitem_id)
        user = db.get_user(device_id)
        if user.gold < mpitem.price:
            return jsonify({"error": "Not enough money"}), 401
        db.user_buy_marketplace_item(mpitem_id, user.id, lambda l: app.logger.info(l))
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/buy_achievement", methods=["POST"])
@cross_origin()
def buy_achievement():
    try:
        app.logger.info(f"buy_achievement")
        req_data = request.get_json()
        app.logger.info(req_data)
        achievement = req_data["achievement"]
        price = req_data["price"]
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        else:
            device_id = request.headers.get('Authorization')
        user = db.get_user(device_id)
        if user.gold < price:
            return jsonify({"error": "Not enough money"}), 401
        db.add_achievements(device_id=device_id, achievements=[achievement])
        db.remove_gold(device_id, price)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/deactivate_marketplace_item", methods=["POST"])
@cross_origin()
def deactivate_marketplace_item():
    try:
        app.logger.info(f"deactivate_marketplace_item")
        req_data = request.get_json()
        app.logger.info(req_data)
        mpitem_id = req_data["id"]
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        else:
            device_id = request.headers.get('Authorization')
        mpitem = db.get_marketplace_item(mpitem_id)
        user = db.get_user(device_id)
        if mpitem.author.id != user.id:
            return jsonify({"error": "You do not own this MPItem"}), 401

        db.change_marketplace_item_soft_delete(mpitem_id, True)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/restore_marketplace_item", methods=["POST"])
@cross_origin()
def restore_marketplace_item():
    try:
        app.logger.info(f"restore_marketplace_item")
        req_data = request.get_json()
        app.logger.info(req_data)
        mpitem_id = req_data["id"]
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        else:
            device_id = request.headers.get('Authorization')
        mpitem = db.get_marketplace_item(mpitem_id)
        user = db.get_user(device_id)
        if mpitem.author.id != user.id:
            return jsonify({"error": "You do not own this MPItem"}), 401

        db.change_marketplace_item_soft_delete(mpitem_id, False)
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/reset_weekly_use", methods=["POST"])
@cross_origin()
def reset_weekly_use():
    try:
        app.logger.info(f"reset weekly use")
        mpitem = db.reset_played_this_week_marketplace()
        return jsonify({"ok": "ok"})
    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/get_my_marketplace_items", methods=["GET"])
@cross_origin()
def get_my_marketplace_items():
    try:
        app.logger.info(f"get_my_marketplace_items")
        req_data = request.get_json()
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        else:
            device_id = request.headers.get('Authorization')
        user = db.get_user(device_id)
        mpitems = db.get_marketplace_items_of_seller(user.id)
        mpitems_serialized = []
        for m in mpitems:
            app.logger.info(m.transactions)
            mpitems_serialized.append({
                "softDelete": m.soft_delete,
                "id": m.id,
                "createdAt": m.created_date,
                "price": m.price,
                "item": m.item,
                "tags": m.tags.split(':'),
                "revenueAllTime": m.revenue_all_time,
                "boughtAllTime": m.bought_all_time,
                "usedAllTime": m.used_all_time,
                "usedLastWeek": m.used_last_week,
                "transactions": list(map(lambda t: {
                    "buyer": {"nickname": t.buyer.nickname, "status": t.buyer.status}, "amount": t.amount, "date": t.created_date
                    }, m.transactions[:5]))
            })

        return jsonify({"myMarketplaceItems": mpitems_serialized})

    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/update_marketplace_item", methods=["POST"])
@cross_origin()
def update_marketplace_item():
    try:
        app.logger.info(f"update_marketplace_item")
        req_data = request.get_json()
        app.logger.info(req_data)
        mpitem_id = req_data["id"]
        price = req_data["price"]
        if not request.headers.get('Authorization'):
            return jsonify({"error": "Not authorized"}), 401
        else:
            device_id = request.headers.get('Authorization')
        mpitem = db.get_marketplace_item(mpitem_id)
        user = db.get_user(device_id)
        if mpitem.author.id != user.id:
            return jsonify({"error": "You do not own this MPItem"}), 401

        if type(price) != int:
            return jsonify({"error": "price must be an integer"}), 401
        if price < 0:
            return jsonify({"error": "price must be positive"}), 401

        db.update_marketplace_item(mpitem_id, price=price)

        return jsonify({"ok": "ok"})

    except Exception as e:
        app.logger.error(str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

if __name__ != "__main__":
    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

if __name__ == "__main__":
    app.run(port=3000)
