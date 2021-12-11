import random
from .utils import cut_trailing_sentence, first_to_second_person, get_similarity

ACT_DO = "ACT_DO"
ACT_SAY = "ACT_SAY"
TEXT = "TEXT"
IMAGE = "IMAGE"
ORIGIN = "ORIGIN"
LOCATION = "LOCATION"

ERROR_MODEL_LOOPING = "MODEL_LOOPING"


class Action:
    def __init__(self, t=ACT_DO, payload="", metadata={}):
        self.type = t
        self.payload = payload
        self.metadata = metadata

    def __str__(self):
        action = ""
        if self.type == ACT_DO:
            action = self.payload
            action = action.strip()
            if len(action) is 0:
                return "\n> continue\n"
            action = action[0].lower() + action[1:]
            if action[0] == '"':
                # This is wrong and doesnt work. fix it
                # it's actually a say
                action = 'You say "' + action[1:]
                if action[-1] != '"':
                    action = action + '"'
            else:
#               if "you" not in action[:6] and "i" not in action[:6]:
#                   action = "you " + action

                if action[-1] not in [".", "?", "!"]:
                    action = action + "."

                action = action[0].upper() + action[1:]

                action = first_to_second_person(action)
        else:
            action = 'You say "' + self.payload + '"'
        return "\n> " + action + "\n"

    def to_dict(self):
        return {"type": self.type, "payload": self.payload, "metadata": self.metadata}

    @classmethod
    def load_from_dict(cls, dic):
        return Action(dic["type"], dic["payload"], dic.get("metadata", {}))


class Result:
    def __init__(self, t=TEXT, payload=""):
        self.type = t
        self.payload = payload

    def __str__(self):
        if self.type == TEXT:
            return self.payload
        else:
            return ""

    def to_dict(self):
        return {"type": self.type, "payload": self.payload}

    @classmethod
    def load_from_dict(cls, dic):
        return Result(dic["type"], dic["payload"])


class Story:
    def __init__(self, story_start, context="", origin={}):
        self.story_start = story_start
        self.context = context
        # list of actions. First action is the prompt length should always equal that of story blocks
        self.actions = []
        # list of story blocks first story block follows prompt and is intro story
        self.results = []
        self.origin = origin
        self.memory = 20

    @classmethod
    def load_from_dict(cls, dic, origin):
        s = Story("")
        s.story_start = dic["story_start"]
        s.actions = list(map(Action.load_from_dict, dic["actions"]))
        results = []
        for sbs in dic["results"]:
            results.append([Result.load_from_dict(s) for s in sbs])
        s.results = results
        s.context = dic["context"]
        s.origin = origin
        return s

    def add_to_story(self, action, story_blocks):
        self.actions.append(action)
        self.results.append(story_blocks)

    def latest_result(self):

        mem_ind = self.memory
        if len(self.results) < 2:
            latest_result = self.story_start
        else:
            latest_result = self.context
        while mem_ind > 0:

            if len(self.results) >= mem_ind:
                latest_result += str(self.actions[-mem_ind]) + str(
                    # The first block in a bunch of results is always the text one
                    self.results[-mem_ind][0]
                )

            mem_ind -= 1

        return latest_result

    def to_storybits(self):
        story_list = [
            Result(ORIGIN, self.origin).to_dict(),
            Result(TEXT, self.story_start).to_dict(),
        ]
        for i in range(len(self.results)):
            story_list.append(self.actions[i].to_dict())
            # Flatten it for the client
            for r in [r.to_dict() for r in self.results[i]]:
                story_list.append(r)
        return story_list

    # Only for debugging
    def __str__(self):
        story_list = [self.story_start]
        for i in range(len(self.results)):
            story_list.append("\n" + str(self.actions[i]) + "\n")
            story_list.append("\n" + str(self.results[i]))

        return "".join(story_list)

    def to_dict(self):
        # Everything but the origin that has to be saved differently
        story_dict = {}
        story_dict["story_start"] = self.story_start
        story_dict["actions"] = list(map(lambda a: a.to_dict(), self.actions))
        results_serialized = []
        for rs in self.results:
            result_block = []
            for r in rs:
                result_block.append(r.to_dict())
            results_serialized.append(result_block)
        story_dict["results"] = results_serialized
        story_dict["context"] = self.context

        return story_dict


class StoryManager:
    def __init__(self, functions):
        self.functions = functions
        self.story = None

    def start_new_story(self, story_prompt, context="", origin={}) -> Story:
        block = self.functions["generate"](context + story_prompt)
        attempts = 1
        while block is False and attempts < 3:
            attempts += 1
            print("WARNING: Looping the model to find something better")
            block = self.functions["generate"](context + story_prompt)

        if block is False:
            error = ERROR_MODEL_LOOPING
            return None, error

        self.story = Story(
            context + story_prompt + block, context=context, origin=origin
        )
        return self.story, False

    def set_story(self, story):
        self.story = story

    def dict_story(self):
        return self.story.to_dict()

    def story_context(self):
        return self.story.latest_result()


class UnconstrainedStoryManager(StoryManager):
    def act(self, action: Action, user, metadata = {}):
        # Detect game over and win condition. output a new type of storybit
        # Detect new monsters you meet, output a new type of storybit
        # difficulty level. Hard mode -> Add your life is in danger
        result_text = self.generate_result(str(action))
        if result_text is False:
            return ERROR_MODEL_LOOPING, [], []
        if len(self.story.results) >= 2:
            similarity = get_similarity(str(self.story.results[-1][0]), result_text)
            # Bring that number down
            if similarity > 0.9:
                # Do not add it
                return ERROR_MODEL_LOOPING, [], []
        result = Result(TEXT, result_text)
        locations = self.functions["find_locations"](result_text)
        if len(locations) > 0:
            print("Found some locations!", locations)
            location = locations[0]
            # Let's check if the user has visited this location before
            if user.achievements is None:
                user.achievements = []
            if "visited:" + location in user.achievements:
                location_object = Result(
                    LOCATION,
                    {
                        "location": location,
                        "firstVisit": False,
                        "seed": random.randint(0, 10),
                    },
                )
                self.story.add_to_story(action, [result, location_object])
                return (
                    False,
                    [action.to_dict(), result.to_dict(), location_object.to_dict()],
                    [],
                )
            else:
                location_object = Result(
                    LOCATION,
                    {
                        "location": location,
                        "firstVisit": True,
                        "seed": random.randint(0, 10),
                    },
                )
                self.story.add_to_story(action, [result, location_object])
                return (
                    False,
                    [action.to_dict(), result.to_dict(), location_object.to_dict()],
                    ["visited:" + location],
                )
        else:
            self.story.add_to_story(action, [result])
            return False, [action.to_dict(), result.to_dict()], []

    def generate_result(self, action_text):
        # print("DEBUG:")
        # print("Context:")
        # print(self.story_context())
        # print("Action text:")
        # print(action_text)
        block = self.functions["generate"](self.story_context() + action_text)
        attempts = 1
        while block is False and attempts < 3:
            attempts += 1
            print("WARNING: Looping the model to find something better")
            block = self.functions["generate"](self.story_context() + action_text)
        return block
