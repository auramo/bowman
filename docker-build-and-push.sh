#!/bin/bash

set -e

source .env

echo "Building"
echo "Remember to docker login first"

if [[ -z "${DOCKER_REPO}" ]]; then
  echo "Set DOCKER_REPO variable! (hint: put it in .env and source .env first)"
  exit 1
fi


podman build --platform linux/amd64 -t "${DOCKER_REPO}:bowman$(git rev-parse --short HEAD)" -t "${DOCKER_REPO}" .
podman push "${DOCKER_REPO}"

echo "Done!"
