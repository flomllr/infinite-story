#! /bin/bash
cat >/home/ec2-user/init.sh <<EOL
echo "Booting the instance..."
cd ~/infinite-story/
echo "Pulling..."
git stash
git pull
echo "Starting metrics..."
sudo systemctl restart node-exporter
echo "metrics started!"
cd server
echo "Installing the pypi libs..."
~/.local/bin/pipenv install --skip-lock
echo "Downloading the spaCy model..."
~/.local/bin/pipenv run python -m spacy download en_core_web_lg
echo "Downloaded!"
echo "Writing init file: celery"
echo 'cd ~/infinite-story/server && ~/.local/bin/pipenv run celery -A nlp worker -Q nlp -l info -c 1 --loglevel=info --pool solo --task-events' > ~/start-celery-server.sh
chmod +x ~/start-celery-server.sh
echo "Starting celery..."
sudo systemctl restart celery
echo "celery started!"
EOL
su ec2-user <<HEREDOC
bash ~/init.sh
HEREDOC