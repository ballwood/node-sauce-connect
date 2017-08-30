#!/usr/bin/env bash

if [ "$TRAVIS_OS_NAME" == "linux" ];
then

    # x86 Test
    echo "Executing x86 tests"

    # remove old modules
    rm -rf node_modules

    # remove old sc
    rm ./lib/sc

    # download x86 version of node
    # so process.arch will = ia32
    NVER=`node -v`
    wget http://nodejs.org/dist/${NVER}/node-${NVER}-linux-x86.tar.gz
    tar xf node-${NVER}-linux-x86.tar.gz

    # use x86 node
    export PATH=$(pwd)/node-${NVER}-linux-x86/bin:$PATH

    # install packages
    npm install --ignore-scripts

    # unit test
    npm run test

    # install sc
    node install.js

    # test sc
    ./acceptance/tests/test.sh

fi

