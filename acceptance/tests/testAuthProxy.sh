#!/usr/bin/env bash

if [ "$TRAVIS_OS_NAME" == "linux" ] && [ "$TRAVIS_NODE_VERSION" == "8" ];
then

    # HTTP Proxy Auth Test
    echo "Executing authenticated proxy test"

    # remove any proxy set
    unset https_proxy
    unset no_proxy

    # copy auth conf over
    sudo cp ./acceptance/squid-conf/squidAuth.conf /etc/squid3/squid.conf

    # add user
    sudo htpasswd -b -c /etc/squid3/squid_passwd testuser ${PROXY_PASS}

    # remove old sauce connect
    rm ./lib/sc

    # reload squid config
    sudo service squid3 restart

    # wait for squid to start
    sleep 3

    # set https_proxy and hide from output
    https_proxy=http://testuser:${PROXY_PASS}@localhost:3128

    # export so is usable by node & scripts
    export https_proxy

    # install sc
    node install.js

    # test
    ./acceptance/tests/test.sh

fi
