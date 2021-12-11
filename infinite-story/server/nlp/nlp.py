from spacy.matcher import Matcher
import yaml

with open("nlp/config.yaml", "r") as stream:
    data = yaml.safe_load(stream)

LOCATIONS = data["locations"]
VERBS = data["verbs"]
PREPOSITIONS = data["prepositions"]
patterns = [[{"LEMMA": x}] for x in LOCATIONS]


def recursive_subject_search(head, subject):
    subjs = [t for t in head.children if t.dep_ == "nsubj"]
    if len(subjs) == 0:
        while len(subjs) == 0:
            head = head.head
            subjs = [t for t in head.children if t.dep_ == "nsubj"]
            if head.head == head:
                break
    if subject in [s.text.lower() for s in subjs]:
        return True


def check_negation(head):
    negations = [t for t in head.children if t.dep_ == "neg"]
    return len(negations) > 0

def get_pos_nlp(text, nlp):
    doc = nlp(text)
    pos = []
    for token in doc:
        pos.append(token.pos_)
    return pos

# TODO: run back into the forest
def find_locations_nlp(text, nlp):
    matcher = Matcher(nlp.vocab)
    matcher.add("LOCATION", None, *patterns)
    doc = nlp(text)
    matches = matcher(doc)
    locations = []
    for m, start, end in matches:
        span = doc[start:end]
        root = span.root
        if root.head.pos_ == "VERB" and root.head.lemma_ in VERBS:
            # Direct child of the verb easy
            head = root.head
            # check for negations
            if not check_negation(head):
                # now need to check if it's "you"
                if recursive_subject_search(head, "you"):
                    locations.append(span.root.lemma_)
        elif root.dep_ in ["pobj"]:
            # into, through, acros <Location>
            preposition = root.head
            if preposition.text in PREPOSITIONS:
                # it's one of those!
                # get the verb (hopefully)
                head = preposition.head
                if head.pos_ == "VERB" and head.lemma_ in VERBS:
                    if not check_negation(head):
                        if recursive_subject_search(head, "you"):
                            locations.append(span.root.lemma_)
                elif (head.dep_ == "prep" or head.dep_ == "advmod") and head.text in PREPOSITIONS:
                    head = head.head
                    if head.pos_ == "VERB" and head.lemma_ in VERBS:
                        if not check_negation(head):
                            if recursive_subject_search(head, "you"):
                                locations.append(span.root.lemma_)
    return locations
