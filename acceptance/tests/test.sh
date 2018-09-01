#!/usr/bin/env bash

MANIFEST_KEY="$TRAVIS_OS_NAME$SC_ARCH"

EXPECTED_SHASUM=$(cat 'manifest.json' | jq -r ".$MANIFEST_KEY.sha1")

echo "$EXPECTED_SHASUM *./bin/sc" | shasum -c
