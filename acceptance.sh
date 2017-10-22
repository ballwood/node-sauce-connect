#!/usr/bin/env bash

acceptance/tests/test.sh &&
acceptance/tests/testProxy.sh &&
acceptance/tests/testNoProxy.sh &&
acceptance/tests/testAuthProxy.sh &&
acceptance/tests/testEnvVars.sh &&
acceptance/tests/testStrictSSL.sh &&
acceptance/tests/testCAFile.sh &&
acceptance/tests/testCAMultiFile.sh &&
acceptance/tests/testCAString.sh
acceptance/tests/test32.sh
