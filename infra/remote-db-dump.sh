#!/bin/bash
set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <host-ip> <ssh-key-path>"
    exit 1
fi

HOST="$1"
SSH_KEY="$2"
DUMP_FILE="bowman_$(date +%d.%m.%Y_%H.%M.%S)_dump.sql"

ssh -i "$SSH_KEY" "root@$HOST" "podman exec bowman_postgres_1 pg_dump -U bowman bowman > /tmp/$DUMP_FILE"
scp -i "$SSH_KEY" "root@$HOST:/tmp/$DUMP_FILE" "./$DUMP_FILE"
ssh -i "$SSH_KEY" "root@$HOST" "rm /tmp/$DUMP_FILE"

echo "Dump saved to ./$DUMP_FILE"
