#! /bin/bash
cat >/home/ec2-user/init.sh <<EOL
echo "Booting the instance..."
cd ~/infinite-story/
echo "Pulling..."
git pull
echo "Starting metrics..."
sudo systemctl restart node-exporter
sudo service docker start
sleep 10
echo 'sudo docker run --net=host -v ~/statsd.conf:/statsd/statsd.conf prom/statsd-exporter "--statsd.mapping-config=/statsd/statsd.conf"' > ~/start-statsd.sh
sudo systemctl restart statsd
echo "metrics started!"
cd server
echo "Installing the pypi libs..."
~/.local/bin/pipenv install --skip-lock
echo "Starting gunicorn..."
chmod +x ~/start-gunicorn.sh
sudo systemctl restart gunicorn
echo "gunicorn started!"
echo "starting celery and celery beat"
sudo systemctl restart celery
sudo systemctl restart celery-beat
echo "celery and co started"
echo "starting caddy..."
sudo systemctl restart caddy
echo "caddy started"
echo "starting the websocket bridge"
cd server
make ws-server-prod
cd ..
echo "started!"
# echo "Starting the CI..."
# sudo systemctl start ci.timer
# echo "CI Started!"
echo "Starting the bot in prod..."
cd ~/infinite-story/discord-bot
~/.nvm/versions/node/v12.14.0/bin/npm install
~/.nvm/versions/node/v12.14.0/bin/npm run prod
echo "Started the bot in prod!"
EOL
su ec2-user <<HEREDOC
bash ~/init.sh
HEREDOC