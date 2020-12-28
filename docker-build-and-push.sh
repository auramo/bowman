#!/bin/bash

set -e

source .env

echo "Building"
echo "Remember to docker login first"

if [[ -z "${DOCKER_REPO}" ]]; then
  echo "Set DOCKER_REPO variable! (hint: put it in .env and source .env first)"
  exit 1
fi

docker build -t "${DOCKER_REPO}:bowman$(git rev-parse --short HEAD)" -t "${DOCKER_REPO}" .
docker push "${DOCKER_REPO}"

echo "Done!"
