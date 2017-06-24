#!/usr/bin/env bash

if [ "$TRAVIS_OS_NAME" == "linux" ];
then

    # HTTP Proxy Auth Test
    echo "Executing cdn test"

    # remove old sauce connect
    rm ./lib/sc

    # set cdn_url to saucelabs
    sauceconnect_cdnurl=http://localhost:8080/downloads

    export sauceconnect_cdnurl

    # start proxy in bg
    node ./acceptance/support/simple-reverse-proxy.js &

    PROXY_PID=$!

    # install sc
    node install.js

    # test
    ./acceptance/tests/test.sh

    unset sauceconnect_cdn_url
    unset no_proxy

    kill PROXY_PID

fi
