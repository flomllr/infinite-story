cd ~/infinite-story/
echo "Pulling..."
git pull
echo "Starting metrics..."
# Remove below for non gpu machines
sudo systemctl restart dcgm
sudo systemctl restart prometheus-dcgm
# End
sudo systemctl restart node-exporter
echo "metrics started!"
echo "Syncing models..."
aws s3 sync s3://infinite-story-bucket/models/ ~/infinite-story-models/models/
cd server
echo "Installing the pypi libs..."
~/.local/bin/pipenv install --skip-lock
echo "Writing init file: tf"
echo 'source ~/.dlamirc && tensorflow_model_server --model_base_path="/home/ec2-user/infinite-story-models/models/generator" --model_name="generator"' > ~/start-tf-server.sh
chmod +x ~/start-tf-server.sh
echo "Writing init file: celery"
echo 'cd ~/infinite-story/server && ~/.local/bin/pipenv run celery -A inference worker -Q inference -l info -c 1 -n inference --loglevel=info --pool solo' > ~/start-celery-server.sh
chmod +x ~/start-celery-server.sh
echo "Starting tensorflow..."
sudo systemctl restart tensorflow
echo "tensorflow started!"
# Let the model server load everything and warmup
sleep 5m
echo "Starting celery..."
sudo systemctl restart celery
echo "celery started!"