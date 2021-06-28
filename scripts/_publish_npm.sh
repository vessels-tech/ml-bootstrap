#!/usr/bin/env bash

set -u

# Notes:
# I'm currently publishing this as lwilld
# Increment the version in package.json yourself!

# Check if the user is logged in, and fail if we aren't and there is no NPM_TOKEN set
npm whoami &> /dev/null
LOGGED_IN_PASSED=${?}

if [ ${LOGGED_IN_PASSED} != "0" ] && [ -z ${NPM_TOKEN} ]; then
  echo "'npm whoami' failed, and 'NPM_TOKEN' is not set."
  echo "Login or set 'NPM_TOKEN' and try again"
  exit 1
fi

set -e

RELEASE_TAG=${RELEASE_TAG-`cat package.json | jq .version -r`}
PACKAGE_NAME=${PACKAGE_NAME-`cat package.json | jq .name -r`}

npm run build

echo "Releasing ${PACKAGE_NAME}:${RELEASE_TAG}"

npm publish --access-public