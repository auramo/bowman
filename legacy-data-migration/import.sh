#!/bin/bash

set -e

if [ $# -lt 2 ]; then
    echo "Usage: <data import dir> <payment group id>"
    exit 1
fi

lein run "$1"
node importer.js "$1" "$2"
