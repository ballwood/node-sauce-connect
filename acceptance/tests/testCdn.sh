#!/usr/bin/env bash

# remove old sauce connect
rm ./lib/sc

# start proxy in bg
node ./acceptance/support/simple-reverse-proxy.js &

PROXY_PID=$!

# install sc
node install.js

# test
./acceptance/tests/test.sh

# ps -p Checks if the process is still running. If it is it returns 0,
# otherwise it returns 1
ps -p $PROXY_PID > /dev/null
PROXY_TASK_RUNNING=$?

# check if the process is still running by examining the exit code of ps -p
PROXY_TEST_RESULT=1
if [ $TASK_RUNNING -eq 1 ]; then
  # not running, so has been hit.
  PROXY_TEST_RESULT=0
fi

kill $PROXY_PID

exit $PROXY_TEST_RESULT

