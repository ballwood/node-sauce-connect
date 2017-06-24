#!/usr/bin/env bash

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
