#!/usr/bin/env bash

# Notes:
# I'm currently publishing this as lwilld
# Increment the version in package.json yourself!

if [ -z ${NPM_TOKEN} ]; then
  echo "'NPM_TOKEN' is not set. Set 'NPM_TOKEN' and try again"
  exit 1
fi

RELEASE_TAG=${RELEASE_TAG-`cat package.json | jq .version -r`}
PACKAGE_NAME=${PACKAGE_NAME-`cat package.json | jq .name -r`}

echo "Releasing ${PACKAGE_NAME}:${RELEASE_TAG}"

npm publish --tag v${RELEASE_TAG} --access-public