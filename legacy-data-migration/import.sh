#!/bin/bash

set -e

if [ $# -lt 3 ]; then
    echo "Usage: <data import path> <temp data import dir> <payment group id>"
    exit 1
fi

[ -s "import_vars.sh" ] && \. "import_vars.sh"

export RESOURCE_PATH="$1"
lein run "$2"
node importer.js "$2" "$3"
