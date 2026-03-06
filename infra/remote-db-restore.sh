#!/bin/bash
set -e

if [ $# -lt 3 ]; then
    echo "Usage: $0 <host-ip> <ssh-key-path> <dump-file>"
    exit 1
fi

HOST="$1"
SSH_KEY="$2"
DUMP_FILE="$3"

scp -i "$SSH_KEY" "$DUMP_FILE" "root@$HOST:/tmp/$(basename "$DUMP_FILE")"
ssh -i "$SSH_KEY" "root@$HOST" "podman exec -i bowman_postgres_1 psql -U bowman -d bowman < /tmp/$(basename "$DUMP_FILE")"
ssh -i "$SSH_KEY" "root@$HOST" "rm /tmp/$(basename "$DUMP_FILE")"

echo "Restored $DUMP_FILE to remote database"
