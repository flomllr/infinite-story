from __future__ import absolute_import, unicode_literals
from celery import Celery
from celery.schedules import crontab
import os

redis_endpoint = os.getenv('REDIS', "redis://cluster.cgerza.0001.euc1.cache.amazonaws.com/0")
app = Celery(
    "inference_server",
    broker=redis_endpoint,
    backend=redis_endpoint,
    include=["partyprocessor.tasks"],
)

# Optional configuration, see the application user guide.
app.conf.update(
        result_expires=3600,
        task_routes=(
            [
                ("nlp.tasks.*", {"queue": "nlp"}),
                ("inference.tasks.*", {"queue": "inference"}),
                ("partyprocessor.tasks.*", {"queue": "partyprocessor"}),
                ],
            ),
        )

if __name__ == "__main__":
    app.start()
