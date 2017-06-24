#!/usr/bin/env bash

if [ "$TRAVIS_OS_NAME" == "linux" ] && [ "$TRAVIS_NODE_VERSION" == "8" ];
then

    # No Http Proxy Test
    echo "Executing no proxy test"

    # remove any proxy set
    unset https_proxy
    unset no_proxy

    # copy auth conf over
    sudo cp ./acceptance/squid-conf/squidNoProxy.conf /etc/squid3/squid.conf

    # remove old sauce connect
    rm ./lib/sc

    # reload squid config
    sudo service squid3 restart

    # wait for squid to start
    sleep 3

    # set https_proxy
    export https_proxy=http://localhost:3128

    # set no proxy for saucelabs.com
    export no_proxy=saucelabs.com

    # install sc
    node install.js

    # test
    ./acceptance/tests/test.sh

fi
