#!/bin/bash

set -e

source .env

echo "Pulling and restarting on remote"

ssh -i "$SSH_REMOTE_KEY" "$SSH_MACHINE" "( cd bowman && sudo /usr/local/bin/docker-compose pull && sudo /usr/local/bin/docker-compose up -d )"

echo "Done!"
