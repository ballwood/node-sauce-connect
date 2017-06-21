#!/usr/bin/env bash

./tests/test.sh && ./tests/testProxy.sh && ./tests/testNoProxy.sh && ./tests/testAuthProxy.sh && ./tests/test32.sh
