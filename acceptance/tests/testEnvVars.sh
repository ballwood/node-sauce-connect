#!/usr/bin/env bash

# only test env vars on 1 build, spams saucelabs otherwise
if [ "$TRAVIS_NODE_VERSION" == "8" ];
then

    export npm_config_sauceconnect_cdnurl="http://localhost:8080/downloads"

    # test
    ./acceptance/tests/testCdn.sh

    unset npm_config_sauceconnect_cdnurl

    export sauceconnect_cdnurl="http://localhost:8080/downloads"

    # test
    ./acceptance/tests/testCdn.sh

    unset sauceconnect_cdnurl

    export SAUCECONNECT_CDNURL="http://localhost:8080/downloads"

    # test
    ./acceptance/tests/testCdn.sh

    unset SAUCECONNECT_CDNURL

fi
