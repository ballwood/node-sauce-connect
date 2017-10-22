#!/usr/bin/env bash

# remove old sauce connect
rm ./lib/sc

# start proxy in bg
node ./acceptance/support/self-signed-https-server.js &

SSL_PROXY_PID=$!

echo "SSL reverse proxy started on 8081 PID: ${SSL_PROXY_PID}"

export SAUCECONNECT_CDNURL=https://localhost:8081/downloads
CA_STRING=$(awk '{printf "%s\\n", $0}' ./acceptance/support/keys/ca.crt)

# write to .npmrc as bash parses newlines
echo ca=\"$CA_STRING\" > .npmrc

# install sc
npm install

unset SAUCECONNECT_CDNURL
unset CA_STRING
rm .npmrc

# test
./acceptance/tests/test.sh

# ps -p Checks if the process is still running. If it is it returns 0,
# otherwise it returns 1
ps -p $SSL_PROXY_PID > /dev/null
SSL_PROXY_TASK_RUNNING=$?

# check if the process is still running by examining the exit code of ps -p
CA_TEST_RESULT=1

if [ $SSL_PROXY_TASK_RUNNING -eq 1 ]; then
  # not running, so has been hit.
  echo "SSL proxy finished, test passed"
  CA_TEST_RESULT=0
else
  echo "SSL proxy not finished, test failed"
  kill $SSL_PROXY_PID
fi

exit $CA_TEST_RESULT
