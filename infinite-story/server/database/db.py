from story.story_manager import Story
from sqlalchemy import create_engine, desc
from sqlalchemy import Column, String, Integer, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from story.utils import make_default_title_from_origin
from datetime import datetime
from random import randint
import os
import requests
import time

db_string = os.getenv(
    'POSTGRES', "CHANGE_ME")
ws_server = os.getenv("WS_SERVER", "http://localhost:8888/broadcasttoeverybody")
base = declarative_base()


class User(base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    nickname = Column(String, unique=True)
    status = Column(String, default="PEASANT")
    email_address = Column(String, unique=True)
    platform = Column(String, nullable=False)
    device_id = Column(
        String, unique=True, nullable=False
    )  # Unique ID generated on the first startup and stored into the storage
    push_token = Column(String)
    discord_id = Column(String, unique=True, nullable=True)
    achievements = Column(JSON)
    multiplayer_achievements = Column(JSON)
    gold = Column(Integer, nullable=False, default=0)
    settings = Column(JSON, nullable=False)
    created_date = Column(DateTime(timezone=True), server_default=func.now())


class DiscordLink(base):
    __tablename__ = "discord_link"
    id = Column(Integer, primary_key=True)
    discord_id = Column(String, unique=True)
    code = Column(String, unique=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())

class Offers(base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True)
    offer = Column(JSON)
    code = Column(String, unique=True)
    offer_type = Column(String)

class PartyGame(base):
    __tablename__ = "partygames"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True)
    serialized = Column(JSON)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), server_default=func.now())

class StoryDB(base):
    __tablename__ = "stories"
    id = Column(Integer, primary_key=True)
    user = relationship("User", back_populates="stories")
    serialized = Column(JSON)
    title = Column(String, nullable=False)
    public = Column(Boolean, nullable=False, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    theme = Column(String, nullable=False)
    origin = Column(JSON)
    story_metadata = Column(JSON)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), server_default=func.now())


User.stories = relationship(
    "StoryDB", order_by=StoryDB.id, back_populates="user")


class Prompt(base):
    __tablename__ = "prompts"
    id = Column(Integer, primary_key=True)
    user = relationship("User", back_populates="prompts",
                        foreign_keys="Prompt.user_id")
    author = relationship("User", foreign_keys="Prompt.author_id")
    context = Column(String, nullable=False)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    public = Column(Boolean, nullable=False, default=False)
    advanced = Column(JSON)
    code = Column(String, nullable=False, unique=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), server_default=func.now())


User.prompts = relationship(
    "Prompt", order_by=Prompt.id, back_populates="user", foreign_keys="Prompt.user_id")


class MPItem(base):
    __tablename__ = "mpitems"
    id = Column(Integer, primary_key=True)
    author = relationship("User",
                        foreign_keys="MPItem.author_id")
    used_all_time = Column(Integer, nullable=False, default=0)
    used_last_week = Column(Integer, nullable=False, default=0)
    bought_all_time = Column(Integer, nullable=False, default=0)
    revenue_all_time = Column(Integer, nullable=False, default=0)
    item = Column(JSON, nullable=False)
    price = Column(Integer, nullable=False, default=0)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tags = Column(String, nullable=False, default="SIMPLE")
    soft_delete = Column(Boolean, nullable=False, default=False)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(base):
    __tablename__ = "transactionslog"
    id = Column(Integer, primary_key=True)
    buyer = relationship("User",
                        foreign_keys="Transaction.buyer_id")
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller = relationship("User",
                        foreign_keys="Transaction.seller_id")
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    amount = Column(Integer, nullable=False)
    mpitem = relationship("MPItem",
                        foreign_keys="Transaction.mpitem_id")
    mpitem_id = Column(Integer, ForeignKey("mpitems.id"), nullable=False)

    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), server_default=func.now())


MPItem.transactions = relationship(
    "Transaction", order_by=Transaction.created_date.desc(), back_populates="mpitem", foreign_keys="Transaction.mpitem_id")


def random_n_digit_string(n):
    return ''.join(["{}".format(randint(0, 9)) for num in range(0, n)])


class DB:
    def __init__(self):
        print("Creating a db at string:" + db_string)
        self.db = create_engine(db_string)
        Session = sessionmaker(self.db)
        self.session = Session()
        base.metadata.create_all(self.db)

    def create_prompt(self, context, title, device_id, advanced):
        try:
            code = random_n_digit_string(7)
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            p = Prompt(user=user, author=user, context=context,
                       title=title, code=random_n_digit_string(6), advanced=advanced)
            self.session.add(p)
            self.session.commit()
            return p
        except Exception:
            self.session.rollback()
            raise

    def update_prompt_properties(self, uid, prop: dict):
        try:
            prompt = self.session.query(Prompt).filter(
                Prompt.id == uid).first()
            if "context" in prop.keys():
                prompt.context = prop["context"]
            if "advanced" in prop.keys():
                prompt.advanced = prop["advanced"]
            if "public" in prop.keys():
                prompt.public = prop["public"]
            if "title" in prop.keys():
                prompt.title = prop["title"]
            self.session.commit()
            return prompt
        except Exception:
            self.session.rollback()
            raise

    def import_from_code(self, device_id, code):
        try:
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            og_prompt = self.session.query(Prompt).filter(
                Prompt.code == code).first()
            og_user = self.session.query(User).filter(
                User.id == og_prompt.author_id).first()
            code = random_n_digit_string(7)
            p = Prompt(user=user, author=og_user, context=og_prompt.context,
                       title=og_prompt.title, code=random_n_digit_string(6))
            self.session.add(p)
            self.session.commit()
            return code
        except Exception:
            self.session.rollback()
            raise

    def get_prompts(self, device_id):
        try:
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            prompts = (
                self.session.query(Prompt)
                .filter(Prompt.user_id == user.id)
                .order_by(desc(Prompt.updated_date))
                .all()
            )
            return prompts
        except Exception:
            self.session.rollback()
            raise

    def get_prompt(self, id):
        try:
            prompt = (
                self.session.query(Prompt)
                .filter(Prompt.id == id)
                .order_by(desc(Prompt.updated_date))
                .first()
            )
            return prompt
        except Exception:
            self.session.rollback()
            raise

    def create_discord_link(self, discord_id):
        try:
            # TODO: Retry random n digit until there is no collision
            code = random_n_digit_string(5)
            while True:
                if self.session.query(DiscordLink).filter(DiscordLink.code == code).first() is not None:
                    code = random_n_digit_string(5)
                    continue
                else:
                    break
            d = DiscordLink(discord_id=discord_id, code=code)
            self.session.add(d)
            self.session.commit()
            return code
        except Exception:
            self.session.rollback()
            raise

    def link_user_with_discord(self, device_id, code):
        try:
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            d = self.session.query(DiscordLink).filter(
                DiscordLink.code == code).first()
            user.discord_id = d.discord_id
            self.session.delete(d)
            self.session.commit()
            return code
        except Exception:
            self.session.rollback()
            raise

    def create_offer(self, offer, offer_type):
        if offer_type not in ['ONE_TIME', 'UNLIMITED']:
            raise Exception('Cannot create an offer outside those types: ["ONE_TIME", "UNLIMITED"]')
        try:
            code = random_n_digit_string(6)
            while True:
                if self.session.query(Offers).filter(Offers.code == code).first() is not None:
                    code = random_n_digit_string(6)
                    continue
                else:
                    break
            o = Offers(offer=offer, offer_type=offer_type, code=code)
            self.session.add(o)
            self.session.commit()
            return code
        except Exception:
            self.session.rollback()
            raise

    def redeem_offer(self, code, device_id):
        try:
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            o = self.session.query(Offers).filter(
                Offers.code == code).first()
            if o is None:
                raise Exception("This offer does not exist")
            if o.offer.get("achievements", False) is not False:
                user.achievements = list(set(user.achievements + o.offer["achievements"]))
            elif o.offer.get("gold", False) is not False:
                if ("_redeemed_gold_" + str(o.id)) in user.achievements:
                    raise Exception("You have already redeemed this offer")
                user.gold += o.offer.get("gold", 0)
                user.achievements = list(set(user.achievements + ["_redeemed_gold_" + str(o.id)]))
            if o.offer_type == 'ONE_TIME':
                self.session.delete(o)
            self.session.commit()
            return
        except Exception:
            self.session.rollback()
            raise


    def signup(self, device_id, platform):
        try:
            u = User(device_id=device_id, platform=platform)
            u.achievements = []
            u.multiplayer_achievements = {}
            self.session.add(u)
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def add_achievements(self, device_id, achievements):
        try:
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            if user.achievements is None:
                user.achievements = []
            user.achievements = user.achievements + achievements
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def add_gold(self, device_id, amount):
        try:
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            user.gold += amount
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def remove_gold(self, device_id, amount):
        try:
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            user.gold -= amount
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def get_user_of_story(self, uid):
        story = self.session.query(StoryDB).filter(StoryDB.id == uid).first()
        user = self.session.query(User).filter(
            User.id == story.user_id).first()
        return user

    def get_user_of_prompt(self, uid):
        prompt = self.session.query(Prompt).filter(Prompt.id == uid).first()
        user = self.session.query(User).filter(
            User.id == prompt.user_id).first()
        return user

    def get_user_from_id(self, id):
        user = self.session.query(User).filter(
            User.id == id).first()
        return user

    def get_user(self, device_id):
        user = self.session.query(User).filter(
            User.device_id == device_id).first()
        return user
    def change_user(self, device_id, nickname=None, status=None):
        try:
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            if nickname is not None:
                user.nickname = nickname
            if status is not None:
                user.status = status
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def create_story(self, initial_story: Story, device_id, title):
        try:
            dict_story = initial_story.to_dict()
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            if user is None:
                user = User(device_id=device_id, platform="ios")
                self.session.add(user)
                self.session.commit()
            story_db = StoryDB(
                title=title,
                user=user,
                serialized=dict_story,
                theme="fantasy",
                origin=initial_story.origin,
            )
            self.session.add(story_db)
            self.session.commit()
            return story_db
        except Exception:
            self.session.rollback()
            raise

    def get_story(self, uid):
        try:
            story = self.session.query(StoryDB).filter(
                StoryDB.id == uid).first()
            if story is None:
                raise Exception("STORY_DOES_NOT_EXIST")
            dict_story = story.serialized
            dict_origin = story.origin
            s = Story.load_from_dict(dict_story, dict_origin)
            return {
                "story": s,
                "public": story.public
            }
        except Exception:
            self.session.rollback()
            raise

    def get_db_stories(self, device_id):
        try:
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            stories = (
                self.session.query(StoryDB)
                .filter(StoryDB.user_id == user.id)
                .order_by(desc(StoryDB.updated_date))
                .all()
            )
            return stories
        except Exception:
            self.session.rollback()
            raise

    def update_story_properties(self, uid, prop: dict):
        try:
            story = self.session.query(StoryDB).filter(
                StoryDB.id == uid).first()
            if "public" in prop.keys():
                story.public = prop["public"]
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def update_story(self, uid, story):
        try:
            dict_story = story.to_dict()
            story = self.session.query(StoryDB).filter(
                StoryDB.id == uid).first()
            story.serialized = dict_story
            story.updated_date = datetime.now()
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def delete_story(self, uid):
        try:
            story = self.session.query(StoryDB).filter(
                StoryDB.id == uid).first()
            self.session.delete(story)
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def delete_prompt(self, uid):
        try:
            prompt = self.session.query(Prompt).filter(
                Prompt.id == uid).first()
            self.session.delete(prompt)
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise
    # Party Game
    def create_party_game(self, owner_device_id, initial_story, title):
        try:
            code = random_n_digit_string(5)
            while True:
                exists = self.session.query(PartyGame).filter(
                    PartyGame.code == code).first()
                if exists is not None:
                    code = random_n_digit_string(5)
                else:
                    break
            dict_story = initial_story.to_dict()
            origin_story = initial_story.origin
            storyBits = list(reversed(initial_story.to_storybits()))
            storyBits.insert(0, {"type": "SYSTEM", "payload": 'Press "Done reading" when you are ready!'})
            s = {
                "title": title,
                "owner": owner_device_id,
                "joinCode": code,
                "storyBits": storyBits,
                "storySerialized": dict_story,
                "storyOrigin": origin_story,
                "currentState": "JOINING",
                "untilNextState": None,
                "players": {},
                "playersReady": [],
                "proposals": [],
                "votingStats": {},
                "achievementsStats": {},
                "luckStats": {},
                "voiceCallStatus": {"playersInCall": [], "roomUrl": "https://meet.jit.si/infinitestory_partygame_" + code },
                "bannedPlayers": []
            }
            p = PartyGame(code=code, serialized=s)
            self.session.add(p)
            self.session.commit()
            s["DBID"] = p.id
            p.serialized = s
            self.session.commit()
            return code
        except Exception:
            self.session.rollback()
            raise
    def get_party_game(self, code):
        try:
            p = self.session.query(PartyGame).filter(
                PartyGame.code == code).first()
            if p is None:
                return False
            return p.serialized
        except Exception:
            self.session.rollback()
            raise

    def get_party_game_story(self, code):
        try:
            p = self.session.query(PartyGame).filter(
                PartyGame.code == code).first()
            dict_story = p.serialized["storySerialized"]
            dict_origin = p.serialized["storyOrigin"]
            s = Story.load_from_dict(dict_story, dict_origin)
            return s
        except Exception:
            self.session.rollback()
            raise
    def save_multiplayer_achievements(self, device_id, achievements):
        try:
            print("Adding achievements for " + device_id, achievements)
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            if user.multiplayer_achievements is None:
                print("Initializing multiplayer achievementes for " + device_id)
                user.multiplayer_achievements = {}
            updated_achievements = user.multiplayer_achievements
            for a in achievements:
                updated_achievements[a["type"]] = user.multiplayer_achievements.get(a["type"], 0) + 1
            print("Updated achievements: ", user.multiplayer_achievements)
            user.multiplayer_achievements = None
            # TODO: Fix this and understand why it is not being changed. A potential hack setting it to null, committing, and setting it again.
            self.session.commit()
            user.multiplayer_achievements = updated_achievements
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def create_or_sync_party_game_story(self, device_id, profile_picture, complete_list_of_players, code, story, title):
        try:
            dict_story = story.to_dict()
            user = self.session.query(User).filter(
                User.device_id == device_id).first()
            # Check if the story exists
            stories = (
                self.session.query(StoryDB)
                .filter(StoryDB.user_id == user.id)
                .order_by(desc(StoryDB.updated_date))
                .all()
            )
            s_id = None
            now = int(round(time.time() * 1000))
            for s in stories:
                if s.story_metadata is not None:
                    # Up to 10 minutes to go through a single game loop.
                    if s.story_metadata.get("party_game", False) == True and s.story_metadata.get("code", False) == code and ((now - s.story_metadata.get("updated_date", 0)) < 10 * 60 * 1000):
                        s_id = s.id
                        break
            if s_id is not None:
                print("Updating the party game's story")
                story = self.session.query(StoryDB).filter(
                    StoryDB.id == s_id).first()
                story.serialized = dict_story
                old_meta = story.story_metadata
                epoch = int(round(time.time() * 1000))
                story.story_metadata = {
                        "party_game": True,
                        "code": old_meta["code"],
                        "profile_picture": old_meta["profile_picture"],
                        "updated_date": epoch,
                        "list_of_players": complete_list_of_players
                    }
                story.updated_date = datetime.now()
                self.session.commit()
            else:
                print("Creating a new linked story for the party game")
                story_db = StoryDB(
                    title=title,
                    user=user,
                    serialized=dict_story,
                    theme="fantasy",
                    origin=story.origin,
                    story_metadata={
                        "party_game": True,
                        "code": code,
                        "profile_picture": profile_picture,
                        "updated_date": int(round(time.time() * 1000)),
                        "list_of_players": complete_list_of_players
                    }
                )
                self.session.add(story_db)
                self.session.commit()
        except Exception:
            self.session.rollback()
            raise


    def save_and_broadcast_party_game(self, code, serialized):
        p = self.session.query(PartyGame).filter(
            PartyGame.code == code).first()
        p.serialized = None
        self.session.commit()
        p.serialized = serialized
        p.updated_date = datetime.now()
        self.session.commit()
        try:
            r = requests.post(ws_server, json={"channel": "partygame/" + code, "payload": serialized})
            if r.status_code is 200:
                print("Successfully broadcasted state update to channel: " + "partygame/" + code)
            else:
                print("Error broadcasting state update to channel: " + "partygame/" + code)
                print(r.json())
        except Exception:
            print("Error broadcasting")

    def broadcast_message_to_party_game(self, code, message):
        r = requests.post(ws_server, json={"channel": "partygame_message/" + code, "payload": message})
        if r.status_code is 200:
            print("Successfully broadcasted a message to channel: " + "partygame_message/" + code)
        else:
            print("Error broadcasting a message to channel: " + "partygame_message/" + code)
            print(r.json())

    # Admin stuff for party games
    def get_all_running_party_games(self):
        return self.session.query(PartyGame).all()

    def delete_party_game(self, uid):
        try:
            p = self.session.query(PartyGame).filter(
                PartyGame.id == uid).first()
            self.session.delete(p)
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise
    # Marketplace stuff
    def get_all_marketplace_items(self, tag):
        try:
            if tag is None:
                mpitems = (
                    self.session.query(MPItem)
                    .filter(MPItem.soft_delete == False)
                    .filter(~MPItem.tags.contains("NSFW"))
                    .order_by(desc(MPItem.bought_all_time), desc(MPItem.created_date))
                    .all()
                )
            else:
                if tag == "NSFW":
                    mpitems = (
                        self.session.query(MPItem)
                        .filter(MPItem.soft_delete == False)
                        .filter(MPItem.tags.contains("NSFW"))
                        .order_by(desc(MPItem.used_all_time), desc(MPItem.created_date))
                        .all()
                    )
                else:
                    mpitems = (
                        self.session.query(MPItem)
                        .filter(MPItem.soft_delete == False)
                        .filter(MPItem.tags.contains(tag))
                        .filter(~MPItem.tags.contains("NSFW"))
                        .order_by(desc(MPItem.used_all_time), desc(MPItem.created_date))
                        .all()
                    )
            return mpitems
        except Exception:
            self.session.rollback()
            raise

    def get_marketplace_item(self, uid):
        try:
            mpitem = (
                self.session.query(MPItem)
                .filter(
                MPItem.id == uid).first()
            )
            return mpitem
        except Exception:
            self.session.rollback()
            raise

    def add_marketplace_item(self, author_id, price, item, tags):
        try:
            user = self.session.query(User).filter(
                User.id == author_id).first()
            mp = MPItem(author=user, price=price,
                       item=item, tags=tags)
            self.session.add(mp)
            self.session.commit()
            return mp
        except Exception:
            self.session.rollback()
            raise

    def increment_mpitem_used_time(self, uid):
        try:
            mp = self.session.query(MPItem).filter(
                MPItem.id == uid).first()
            mp.used_all_time += 1
            mp.used_last_week += 1
            self.session.commit()
            return mp
        except Exception:
            self.session.rollback()
            raise

    def user_buy_marketplace_item(self, uid, buyer_id, logger):
        try:
            buyer = self.session.query(User).filter(
                User.id == buyer_id).first()
            mpitem = self.session.query(MPItem).filter(
                MPItem.id == uid).first()
            seller = self.session.query(User).filter(
                User.id == mpitem.author.id).first()
            buyer.gold -= mpitem.price
            seller.gold += mpitem.price
            mpitem.revenue_all_time += mpitem.price
            mpitem.bought_all_time += 1
            item_name = mpitem.item["item"]["name"]
            push_endpoint = f"https://appcenter.ms/api/v0.1/apps/flomllr/infinite-story-{seller.platform}/push/notifications"
            r = requests.post(push_endpoint, json={
                    "notification_content": {
                          "name": f"notifying seller {seller.id} about mpitem={mpitem.id} bought by {buyer.id}",
                          "title": f"{buyer.nickname} bought your {item_name} class!",
                          "body": f"You won {mpitem.price} gold pieces. Isn't that nice?",
                          "custom_data": {"mpItemId": mpitem.id, "amount": mpitem.price, "buyerNickname": buyer.nickname, "buyerStatus": buyer.status}
                    },
                    "notification_target": {
                            "type": "user_ids_target",
                            "user_ids": [ seller.device_id ]
                    }
                  },
                  headers={
                    "X-API-Token": "8a57e795471961d129028e73f481ab0897f34560"
                  }
            )
            if r.status_code is 202:
                logger("Successfully queues a push notification to seller: " + seller.device_id)
            else:
                logger("Error queueing a push notification")
                logger(r.json())

            t = Transaction(buyer=buyer,seller=seller,mpitem=mpitem, amount=mpitem.price)
            self.session.add(t)
            class_name = mpitem.item["item"]["name"]
            self.add_achievements(buyer.device_id, [f"boughtmarketplaceitem:{mpitem.id}:{class_name}:{mpitem.author.nickname}"])
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

    def change_marketplace_item_soft_delete(self, uid, soft_delete):
        try:
            mp = self.session.query(MPItem).filter(
                MPItem.id == uid).first()
            mp.soft_delete = soft_delete
            self.session.commit()
            return mp
        except Exception:
            self.session.rollback()
            raise

    def update_marketplace_item(self, uid, price):
        try:
            mp = self.session.query(MPItem).filter(
                MPItem.id == uid).first()
            mp.price = price
            self.session.commit()
            return mp
        except Exception:
            self.session.rollback()
            raise

    def get_marketplace_items_of_seller(self, uid):
        try:
            mpitems = (
                self.session.query(MPItem)
                .filter(MPItem.author_id == uid)
                .order_by(MPItem.created_date.desc())
                .all()
            )
            return mpitems
        except Exception:
            self.session.rollback()
            raise
    def reset_played_this_week_marketplace(self):
        try:
            self.session.query(MPItem).update({
                MPItem.used_last_week: 0
            }, synchronize_session="fetch")
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise
