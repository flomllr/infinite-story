#! /bin/bash
cat >/home/ec2-user/init.sh <<EOL
echo "Booting the instance..."
cd ~/infinite-story/
echo "Pulling..."
git stash
git pull
echo "Starting metrics..."
# Remove below for non gpu machines
sudo systemctl restart dcgm
sudo systemctl restart prometheus-dcgm
# End
sudo systemctl restart node-exporter
echo "metrics started!"
# echo "Syncing models..."
# aws s3 sync s3://infinite-story-bucket-year2/models/ ~/infinite-story-models/models/
cd server
echo "Installing the pypi libs..."
~/.local/bin/pipenv install --skip-lock
echo "Writing init file: tf"
echo 'source ~/.dlamirc && AWS_ACCESS_KEY_ID=CHANGE_ME AWS_SECRET_ACCESS_KEY=CHANGE_ME S3_ENDPOINT=s3.eu-central-1.amazonaws.com AWS_REGION=eu-central-1 tensorflow_model_server --model_base_path="s3://infinite-story-bucket-year2/models/generator/" --model_name="generator"' > ~/start-tf-server.sh
chmod +x ~/start-tf-server.sh
echo "Writing init file: celery"
echo 'cd ~/infinite-story/server && ~/.local/bin/pipenv run celery -A inference worker -Q inference -l info -c 1 --loglevel=info --pool solo --task-events' > ~/start-celery-server.sh
chmod +x ~/start-celery-server.sh
echo "Starting tensorflow..."
sudo systemctl restart tensorflow
echo "tensorflow started!"
# Let the model server load everything and warmup
sleep 5m
echo "Starting celery..."
sudo systemctl restart celery
echo "celery started!"
EOL
su ec2-user <<HEREDOC
bash ~/init.sh
HEREDOC