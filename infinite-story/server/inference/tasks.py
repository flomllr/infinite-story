from __future__ import absolute_import, unicode_literals

# from celery.signals import worker_init, worker_process_init
from celery import signals
import sys
from pathlib import Path
from inference.celery import app

GPT2 = None
# print('\n'.join(sys.path)) # does this show the files and folders you need?

# @worker_process_init.connect()
# def init(*args, **kwargs):
#     print("worker_process_init")


# @worker_init.connect()
# def configure_worker(*args, **kwargs):
#     print("@worker_init.connect() Fired!")
#     import gpt2

#     print("Initiated")
#     global GPT2
#     GPT2 = gpt2.GPT2Generator()


@signals.celeryd_init.connect
def setup(sender, conf, **kwargs):
    try:
        print("Loading the GPT2 runner....")
        sys.path.append(str(Path(__file__).parent.parent))
        # print('\n'.join(sys.path)) # does this show the files and folders you need?
        from gpt2 import gpt2_generator_savedmodel
        global GPT2
        GPT2 = gpt2_generator_savedmodel.GPT2GeneratorSavedModel()
        GPT2.generate("Warmup ...", no_loop=True)
    except Exception as e:
        print("Error while preparing the node: " + str(e))


@app.task
def generate(text):
    generated_text = GPT2.generate(text)
    return generated_text
