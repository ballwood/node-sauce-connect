#!/usr/bin/env bash

if [ "$TRAVIS_OS_NAME" == "linux" ];
then

    # HTTP Proxy Auth Test
    echo "Executing cdn test"

    # remove old sauce connect
    rm ./lib/sc

    # set cdn_url to saucelabs
    export sauceconnect_cdn_url=https://saucelabs.com/

    # install sc
    node install.js

    # test
    ./acceptance/tests/test.sh

    unset sauceconnect_cdn_url

fi
