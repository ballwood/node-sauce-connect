#!/usr/bin/env bash

if [ "$TRAVIS_OS_NAME" == "linux" ];
then

    # HTTP Proxy No Auth Test
    echo "Executing proxy test"

    # remove any proxy set
    unset https_proxy
    unset no_proxy

    # set https_proxy
    export https_proxy=http://localhost:3128

    # remove old sauce connect
    rm ./lib/sc

    # install sc
    node install.js

    # test
    ./test.sh

fi
