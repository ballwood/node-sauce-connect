#!/usr/bin/env bash

# remove old sauce connect
rm ./lib/sc

# start proxy in bg
node ./acceptance/support/simple-reverse-proxy.js &

PROXY_PID=$!

echo "Proxy started on 8080 PID: ${PROXY_PID}"

# install sc
npm install

# test
./acceptance/tests/test.sh

# ps -p Checks if the process is still running. If it is it returns 0,
# otherwise it returns 1
ps -p $PROXY_PID > /dev/null
PROXY_TASK_RUNNING=$?

# check if the process is still running by examining the exit code of ps -p
PROXY_TEST_RESULT=1

if [ $PROXY_TASK_RUNNING -eq 1 ]; then
  # not running, so has been hit.
  echo "Proxy finished, test passed"
  PROXY_TEST_RESULT=0
else
  echo "Proxy not finished, test failed"
  kill $PROXY_PID
fi

exit $PROXY_TEST_RESULT

