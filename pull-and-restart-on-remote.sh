#!/bin/bash

set -e

source .env

echo "Removing old container and images"

ssh -i "$SSH_REMOTE_KEY" "$SSH_MACHINE" "( cd bowman && sudo /usr/local/bin/docker-compose stop )"

set +e # Ignore exit codes for these:
ssh -i "$SSH_REMOTE_KEY" "$SSH_MACHINE" "sudo docker rm bowman_web_1"
ssh -i "$SSH_REMOTE_KEY" "$SSH_MACHINE" "sudo docker images -a | grep auramo2 | awk '{print $3}' | xargs sudo docker rmi"
set -e

echo "Pulling and restarting on remote"

ssh -i "$SSH_REMOTE_KEY" "$SSH_MACHINE" "( cd bowman && sudo /usr/local/bin/docker-compose up -d )"

echo "Done!"
