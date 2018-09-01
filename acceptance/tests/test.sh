#!/usr/bin/env bash

MANIFEST_KEY="$TRAVIS_OS_NAME$SC_ARCH"

EXPECTED_SHASUM=$(cat 'manifest.json' | jq -r ".$MANIFEST_KEY.sha1")
ACTUAL_SHASUM=$(shasum ./bin/sc | cut -b-40)

echo "Expected SHASUM: '$EXPECTED_SHASUM'"
echo "Actual SHASUM: '$ACTUAL_SHASUM'"

if [ "$EXPECTED_SHASUM" == "$ACTUAL_SHASUM" ]; then
  exit 0;
fi

exit 1;
