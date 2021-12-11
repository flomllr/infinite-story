.PHONY: story
.PHONY: nlp
.PHONY: inference
.PHONY: bootup-services
.PHONY: party
.PHONY: ws-server
bootup-services:
	sudo systemctl start tensorflow && sudo systemctl start redis
story:
	WS_SERVER=http://localhost:8080/broadcasttoeverybody REDIS=redis://localhost/0 POSTGRES=postgres://infinite:infinite@localhost/infinite FLASK_APP=story_server.py FLASK_ENV=development flask run --host 0.0.0.0 --port 3000
spacy-setup:
	python -m spacy download en_core_web_lg
nlp:
	REDIS=redis://localhost/0 celery -A nlp worker -Q nlp -l info -c 1 --loglevel=info --pool solo --task-events --hostname nlp
inference:
	REDIS=redis://localhost/0 celery -A inference worker -Q inference -l info -c 1 --loglevel=info --pool solo --task-events --hostname inference
party:
	REDIS=redis://localhost/0 POSTGRES=postgres://infinite:infinite@localhost/infinite celery -A partyprocessor worker -Q partyprocessor -l info -c 1 --loglevel=info --pool solo --task-events --hostname partyprocessor
party-beat:
	REDIS=redis://localhost/0 celery -A partyprocessor beat --loglevel=info
ws-server:
	docker run -d --network host alash3al/wsify -listen :8080 -webhook "" --events="" --publish="/broadcasttoeverybody" --debug true
ws-server-prod:
	docker run -d --network host alash3al/wsify -listen :8888 -webhook "" --events="" --publish="/broadcasttoeverybody" --debug true 
