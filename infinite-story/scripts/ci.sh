cd ~/infinite-story
git fetch
prev=$(git rev-parse HEAD)
fut=$(git rev-parse @{u})
if [ $prev != $fut ]
then
  echo "New version available, restarting gunicorn"
  git pull
  kill -HUP $(cat /home/ec2-user/gunicorn.pid)
fi