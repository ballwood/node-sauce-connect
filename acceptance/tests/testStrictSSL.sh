#!/usr/bin/env bash

# remove old sauce connect
rm ./lib/sc

# start proxy in bg
node ./acceptance/support/self-signed-https-server.js &

SSL_PROXY_PID=$!

echo "SSL reverse proxy started on 8081 PID: ${SSL_PROXY_PID}"

export npm_config_strict_ssl=false;
export SAUCECONNECT_CDNURL=https://localhost:8081/downloads

# install sc
node install.js

unset npm_config_strict_ssl
unset SAUCECONNECT_CDNURL

# test
./acceptance/tests/test.sh

# ps -p Checks if the process is still running. If it is it returns 0,
# otherwise it returns 1
ps -p $SSL_PROXY_PID > /dev/null
SSL_PROXY_TASK_RUNNING=$?

# check if the process is still running by examining the exit code of ps -p
STRICT_SSL_TEST_RESULT=1

if [ $SSL_PROXY_TASK_RUNNING -eq 1 ]; then
  # not running, so has been hit.
  echo "SSL proxy finished, test passed"
  STRICT_SSL_TEST_RESULT=0
else
  echo "SSL proxy not finished, test failed"
  kill $SSL_PROXY_PID
fi

exit $STRICT_SSL_TEST_RESULT
