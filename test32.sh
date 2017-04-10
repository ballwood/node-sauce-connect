echo "Travis OS Name"
echo $TRAVIS_OS_NAME

if [ "$TRAVIS_OS_NAME" == "linux" ];
then

    # remove old modules
    rm -rf node_modules

    NVER=`node -v`
    wget http://nodejs.org/dist/${NVER}/node-${NVER}-linux-x86.tar.gz
    tar xf node-${NVER}-linux-x86.tar.gz

    # enable 32 bit node
    export PATH=$(pwd)/node-${NVER}-linux-x86/bin:$PATH

    npm install --ignore-scripts

    npm run test

    node install.js

    ./test.sh

fi

