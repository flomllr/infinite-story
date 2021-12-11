#! /bin/bash
cat >/home/ec2-user/ci.sh <<- "EOL"
cd ~/infinite-story-mobile
git fetch
prev=$(git rev-parse HEAD)
fut=$(git rev-parse @{u})
if [ $prev != $fut ]
then
  echo "New version available, restarting next js"
  git pull
  echo "Building..."
  source ~/.bashrc && ~/.nvm/versions/node/v12.13.1/bin/npx next build
  echo "Restarting the server..."
  sudo systemctl restart nextjs
  echo "Done!"
fi
EOL
cat >/home/ec2-user/init.sh <<EOL
echo "Booting the instance..."
source ~/.bashrc
cd ~/infinite-story-mobile/
# Current version on the AMI is fine. Don't break shit pls.
# echo "Pulling..."
# git stash
# git pull
echo "Starting metrics..."
sudo systemctl restart node-exporter
# echo "Installing the node js libs..."
# ~/.nvm/versions/node/v12.13.1/bin/npm install
# echo "Writing init file: nextjs"
# echo 'source ~/.bashrc && cd ~/infinite-story-mobile && ~/.nvm/versions/node/v12.13.1/bin/npx next start' > ~/start-nextjs.sh
chmod +x ~/start-nextjs.sh
# echo "Building the NextJS build package..."
# ~/.nvm/versions/node/v12.13.1/bin/npx next build
echo "Starting NextJS..."
sudo systemctl restart nextjs
sudo systemctl restart caddy
echo "NextJS started!"
# echo "Starting the CI..."
# sudo systemctl start ci.timer
# echo "CI Started!"
EOL
su ec2-user <<HEREDOC
bash ~/init.sh
HEREDOC