from __future__ import absolute_import, unicode_literals
from celery import signals
from partyprocessor.celery import app
from celery.utils.log import get_task_logger
from celery.decorators import periodic_task
from celery.task.schedules import crontab
from database.db import DB
import random
from datetime import datetime, timezone, timedelta
import time
from copy import deepcopy
logger = get_task_logger(__name__)

db = None


@signals.celeryd_init.connect
def setup(sender, conf, **kwargs):
    try:
        print("Loading the db ....")
        global db
        db = DB()
        print("Done!")
    except Exception as e:
        print("Error while preparing the node: " + str(e))

DEFAULT_PROPOSALS = [
        {
            "user": "SYSTEM",
            "proposal": {
                "type": "TELL_ME_MORE"
                },
            "votes": []
            },
        {
            "user": "SYSTEM",
            "proposal": {
                "type": "ROLLBACK"
                },
            "votes": []
            },
        ]

DEFAULT_PROPOSALS_NO_ACT = [

        {
            "user": "SYSTEM",
            "proposal": {
                "type": "TELL_ME_MORE"
                },
            "votes": []
            },

        ]

PROPOSE_TIME = 40
VOTE_TIME = 25
TIE_TIME = 5
RESULT_TIME = 5
READ_TIME = 45

def get_delay(ms):
    return int(round(time.time() * 1000 + ms))


PROVOCATIVE_LIST = ["rape", "sex", "semen", "fuck", "dick", "vagina", "pussy", "penis", "ass", "testicles", "boobs", "tits"]

ACHIEVEMENTS = {
            "MOST_LOVED": {
                    "type": "MOST_LOVED",
                    "title": "The Most Loved",
                    "description": "<NAME>'s proposals went through the most out of all players"
                },
            "NEVER_SUCCEEDED": {
                    "type": "NEVER_SUCCEEDED",
                    "title": "The Loser",
                    "description": "None of <NAME>'s proposals were accepted"
                },
            "PASSIVITY_PRICE": {
                    "type": "PASSIVITY_PRICE",
                    "title": "Passivity Price",
                    "description": "<NAME> didn't propose anything?!"
                },
            "WRITER": {
                    "type": "WRITER",
                    "title": "The Writer",
                    "description": "<NAME> wrote the longest proposal"
                },
            "WHO_TALKS": {
                    "type": "WHO_TALKS",
                    "title": "The One Who Talks",
                    "description": "<NAME> submitted the most amount of 'Say' actions"
                }, 
            "WHO_ACTS": {
                    "type": "WHO_ACTS",
                    "title": "The One Who Acts",
                    "description": "<NAME> submitted the most amount of 'Do' actions"
                },
            "PROVOCATIVE": {
                    "type": "PROVOCATIVE",
                    "title": "Provocative",
                    "description": "<NAME>'s proposals were the most provocative"
                },
            "LUCKY": {
                    "type": "LUCKY",
                    "title": "The Lucky One",
                    "description": "<NAME> was really lucky during ties"
                },
        }
def compute_achievement(device_id, p):
    achievements = []
    # Prep the rankings
    most_loved = []
    for k in p["votingStats"].keys():
        val = p["votingStats"][k]
        most_loved.append({"u": k, "v": val})
    most_loved.sort(key=lambda r: r["v"], reverse=True)
    print("Most loved rankings: ", most_loved)
    
    least_loved = list(reversed(most_loved))
    print("Least loved rankings: ", least_loved)

    longest_proposal = []
    total_proposal = []
    for k in p["achievementsStats"].keys():
        val = p["achievementsStats"][k]
        longest_p = 0
        total_proposal.append({"u": k, "v": len(val)})
        for pp in val:
            if len(pp["proposal"]["payload"]) > longest_p:
                longest_p = len(pp["proposal"]["payload"])
        longest_proposal.append({"u": k, "v": longest_p})
    longest_proposal.sort(key=lambda r: r["v"], reverse=True)
    total_proposal.sort(key=lambda r: r["v"], reverse=False)
    print("Longest proposals: ", longest_proposal)
    print("Total proposals (least first): ", total_proposal)


    most_say = []
    most_do = []
    for k in p["achievementsStats"].keys():
        val = p["achievementsStats"][k]
        say = 0
        do = 0
        for pp in val:
            if pp["proposal"]["type"] == "ACT_DO":
                do += 1
            elif pp["proposal"]["type"] == "ACT_SAY":
                say += 1
        most_say.append({"u": k, "v": say})
        most_do.append({"u": k, "v": do})
    most_say.sort(key=lambda r: r["v"], reverse=True)
    most_do.sort(key=lambda r: r["v"], reverse=True)
    print("Most Say: ", most_say)
    print("Most Do: ", most_do)


    most_provocative = []
    for k in p["achievementsStats"].keys():
        val = p["achievementsStats"][k]
        prov = 0
        for pp in val:
            lowercased_p = pp["proposal"]["payload"].lower()
            for ww in PROVOCATIVE_LIST:
                prov += lowercased_p.count(ww)
        most_provocative.append({"u": k, "v": prov})
    most_provocative.sort(key=lambda r: r["v"], reverse=True)
    print("Most Provocative: ", most_provocative)

    most_lucky = []
    for k in p["luckStats"].keys():
        val = p["luckStats"][k]
        most_lucky.append({"u": k, "v": val})
    most_lucky.sort(key=lambda r: r["v"], reverse=True)
    print("Most lucky rankings: ", most_lucky)

    nickname = p["players"][device_id]["nickname"]
    # Most Loved
    if most_loved[0]["v"] != most_loved[1]["v"] and most_loved[0]["u"] == device_id:
        a = deepcopy(ACHIEVEMENTS["MOST_LOVED"])
        a["description"] = a["description"].replace("<NAME>", nickname)
        achievements.append(a)
    # The One Who Never Succeeded
    if least_loved[0]["v"] != least_loved[1]["v"] and least_loved[0]["u"] == device_id and least_loved[0]["v"] == 0:
        a = deepcopy(ACHIEVEMENTS["NEVER_SUCCEEDED"])
        a["description"] = a["description"].replace("<NAME>", nickname)
        achievements.append(a)
    # Passivity Prize
    if total_proposal[0]["v"] != total_proposal[1]["v"] and total_proposal[0]["u"] == device_id and total_proposal[0]["v"] == 0:
        a = deepcopy(ACHIEVEMENTS["PASSIVITY_PRICE"])
        a["description"] = a["description"].replace("<NAME>", nickname)
        achievements.append(a)
    # The Writer
    if longest_proposal[0]["v"] != longest_proposal[1]["v"] and longest_proposal[0]["u"] == device_id:
        a = deepcopy(ACHIEVEMENTS["WRITER"])
        a["description"] = a["description"].replace("<NAME>", nickname)
        achievements.append(a)
    # The One Who Talks
    if most_say[0]["v"] != most_say[1]["v"] and most_say[0]["u"] == device_id:
        a = deepcopy(ACHIEVEMENTS["WHO_TALKS"])
        a["description"] = a["description"].replace("<NAME>", nickname)
        achievements.append(a)
    # Provocative
    if most_provocative[0]["v"] != most_provocative[1]["v"] and most_provocative[0]["u"] == device_id:
        a = deepcopy(ACHIEVEMENTS["PROVOCATIVE"])
        a["description"] = a["description"].replace("<NAME>", nickname)
        achievements.append(a)
    # The One Who Acts
    if most_do[0]["v"] != most_do[1]["v"] and most_do[0]["u"] == device_id:
        a = deepcopy(ACHIEVEMENTS["WHO_ACTS"])
        a["description"] = a["description"].replace("<NAME>", nickname)
        achievements.append(a)
    # Most Lucky
    if most_lucky[0]["v"] != most_lucky[1]["v"] and most_lucky[0]["u"] == device_id:
        a = deepcopy(ACHIEVEMENTS["LUCKY"])
        a["description"] = a["description"].replace("<NAME>", nickname)
        achievements.append(a)

    print("Achievements for " + device_id)
    print(achievements)
    return achievements
    

@app.task
def process_action(code, device_id, action):
    print(code, device_id, action)
    user = db.get_user(device_id)
    p = db.get_party_game(code)
    if p is False:
        print("Exiting early, the game doesn't exist anymore")
        return 0
    if device_id not in p["players"].keys() and action["type"] != "DROP_CALL":
        print("Exiting early, user is not in this game")
        return 0
    if action["type"] == "PING":
        print("New ping time for " + device_id + " is " + str(int(round(time.time() * 1000))))
        p["players"][device_id]["lastPing"] = int(round(time.time() * 1000))
    if action["type"] == "START":
        print("Starting the game...")
        p["currentState"] = "READING"
        p["untilNextState"] = get_delay(READ_TIME * 1000) 
        p["proposals"] = DEFAULT_PROPOSALS_NO_ACT

    if action["type"] == "PROPOSE":
        if len(list(filter(lambda pp: pp["user"] == device_id, p["proposals"]))) == 0:
            p["proposals"].append({
                "user": device_id,
                "proposal": {
                    "type": action["payload"]["type"],
                    "payload": action["payload"]["payload"]
                    },
                "votes": []
                })
            p["playersReady"].append(device_id)
        if len(p["playersReady"]) == len(p["players"]):
            p["currentState"] = "VOTING"
            p["untilNextState"] = get_delay(VOTE_TIME * 1000)
            p["playersReady"] = []

    if action["type"] == "PASS":
        if len(list(filter(lambda pp: pp["user"] == device_id, p["proposals"]))) == 0 and device_id not in p["playersReady"]:
            p["playersReady"].append(device_id)
            if len(p["playersReady"]) == len(p["players"]):
                p["currentState"] = "VOTING"
                p["untilNextState"] = get_delay(VOTE_TIME * 1000)
                p["playersReady"] = []

    if action["type"] == "VOTE":
        for i, pp in enumerate(p["proposals"]):
            p["proposals"][i]["votes"] = list(filter(lambda vv: vv != device_id, pp["votes"]))
        p["proposals"][action["payload"]]["votes"].append(device_id)

    if action["type"] == "NEXT_STATE":
        curr = p["currentState"]
        if curr == "PROPOSING":
            p["currentState"] = "VOTING"
            p["untilNextState"] = get_delay(VOTE_TIME * 1000)
            p["playersReady"] = []
        elif curr == "VOTING":
            for pp in p["proposals"]:
                if pp["user"] != "SYSTEM":
                    p["achievementsStats"][pp["user"]].append(pp)
            sorted_proposals = list(sorted(p["proposals"], key=lambda pp: len(pp["votes"]), reverse=True))
            # More than 1 entry and at least one tie
            if len(sorted_proposals) > 1 and (len(sorted_proposals[0]["votes"]) is len(sorted_proposals[1]["votes"])):
                p["currentState"] = "TIE"
                p["untilNextState"] = get_delay(TIE_TIME * 1000)
                # Break the ties
                tie_entries = []
                for s in sorted_proposals:
                    if len(s["votes"]) == len(sorted_proposals[0]["votes"]):
                        tie_entries.append(s)
                winner = random.randint(0, len(tie_entries) - 1)
                tie_entries[winner]["votes"].append("SYSTEM")
                p["proposals"] = tie_entries
                p["tieBreakDetails"] = {"result": winner + 1, "outOf": len(tie_entries)}
                if tie_entries[winner]["user"] != "SYSTEM":
                    p["luckStats"][tie_entries[winner]["user"]] += 1
            else:
                p["currentState"] = "RESULT"
                p["untilNextState"] = get_delay(RESULT_TIME * 1000)

            # Voting stats
            # Resort
            sorted_proposals = list(sorted(p["proposals"], key=lambda pp: len(pp["votes"]), reverse=True))
            winning_proposal = sorted_proposals[0]
            # Increment winner's count
            if winning_proposal["user"] != "SYSTEM":
                p["votingStats"][winning_proposal["user"]] += 1
        elif curr == "READING":
            p["currentState"] = "PROPOSING"
            p["untilNextState"] = get_delay(PROPOSE_TIME * 1000)
            p["playersReady"] = []
        elif curr == "TIE":
            p["currentState"] = "RESULT"
            p["untilNextState"] = get_delay(RESULT_TIME * 1000)

    if action["type"] == "READY":
        if len(list(filter(lambda r: r == device_id, p["playersReady"]))) == 0:
            p["playersReady"].append(device_id)
        if len(p["playersReady"]) == len(p["players"]):
            p["currentState"] = "PROPOSING"
            p["untilNextState"] = get_delay(PROPOSE_TIME * 1000)
            p["playersReady"] = []

    if action["type"] == "KICK":
        if action["payload"] != device_id:
            old_player = p["players"].pop(action["payload"], None)
            db.broadcast_message_to_party_game(code, old_player["nickname"] + " was disconnected")

    if action["type"] == "BAN":
        if action["payload"] != device_id:
            old_player = p["players"].pop(action["payload"], None)
            p["bannedPlayers"].append(action["payload"])
            db.broadcast_message_to_party_game(code, old_player["nickname"] + " was banned")

    if action["type"] == "END":
        print(device_id, "called END")
        p["currentState"] = "ENDING"
        p["achievements"] = {}
        if len(p["players"]) >= 2:
            for k in p["players"].keys():
                achievements_of_player = compute_achievement(k, p) 
                p["achievements"][k] = achievements_of_player
                db.save_multiplayer_achievements(k, achievements_of_player)

    if action["type"] == "LEAVE":
        player_gone = p["players"].pop(device_id, None)
        if player_gone is not None:
            db.broadcast_message_to_party_game(code, player_gone["nickname"] + " left the game")
        if len(p["players"]) == 0:
            p["currentState"] = "ENDING"
    
    if action["type"] == "JOIN_CALL":
        p["voiceCallStatus"]["playersInCall"] = list(filter(lambda p: p != device_id, p["voiceCallStatus"]["playersInCall"]))
        p["voiceCallStatus"]["playersInCall"].append(device_id)
        
    if action["type"] == "DROP_CALL":
        p["voiceCallStatus"]["playersInCall"] = list(filter(lambda p: p != device_id, p["voiceCallStatus"]["playersInCall"]))

    db.save_and_broadcast_party_game(code, p)
    if p["currentState"] == "ENDING":
        db.delete_party_game(p["DBID"])
    return 0 

@periodic_task(
        run_every=(crontab(minute='*/1')),
        name="partyprocessor.tasks.clean_party_games",
        ignore_result=True
        )
def clean_party_games():
    now = datetime.now(timezone.utc)
    print("Cleaning party games")
    ps = db.get_all_running_party_games()
    for partygame in ps:
        p = partygame.serialized
        if p["currentState"] == "ENDING":
            db.delete_party_game(partygame.id)
        diff = now - partygame.updated_date
        if diff > timedelta(minutes=10):
            print("Cleaning Zombie Party Game: " + str(partygame.id) + " code=" + p["joinCode"])
            db.delete_party_game(partygame.id)


    return 0
