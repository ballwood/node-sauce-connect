#!/usr/bin/env bash

acceptance/tests/test.sh &&
acceptance/tests/testCdn.sh &&
acceptance/tests/testProxy.sh &&
acceptance/tests/testNoProxy.sh &&
acceptance/tests/testAuthProxy.sh &&
acceptance/tests/test32.sh
