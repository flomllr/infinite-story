from __future__ import absolute_import, unicode_literals
from celery import signals
from nlp.celery import app
from spacy.matcher import Matcher
import spacy
from nlp.nlp import find_locations_nlp, get_pos_nlp

nlpObject = None


@signals.celeryd_init.connect
def setup(sender, conf, **kwargs):
    try:
        print("Loading the nlp model....")
        global nlpObject
        nlpObject = spacy.load("en_core_web_lg")
        quote_matcher = Matcher(nlpObject.vocab)
        quote_matcher.add(
            "QUOTED",
            None,
            [{"ORTH": "'"}, {"IS_ALPHA": True, "OP": "+"}, {"ORTH": "'"}],
        )

        def quote_merger(doc):
            # this will be called on the Doc object in the pipeline
            matched_spans = []
            matches = quote_matcher(doc)
            for match_id, start, end in matches:
                span = doc[start:end]
                matched_spans.append(span)
            for (
                span
            ) in matched_spans:  # merge into one token after collecting all matches
                span.merge()
            return doc

        nlpObject.add_pipe(quote_merger, first=True)
    except Exception as e:
        print("Error while preparing the node: " + str(e))


@app.task
def find_locations(text):
    return find_locations_nlp(text, nlpObject)

@app.task
def get_pos(text):
    return get_pos_nlp(text, nlpObject)
