[![Build Status](https://travis-ci.org/ballwood/node-sauce-connect.svg?branch=master)](https://travis-ci.org/ballwood/node-sauce-connect)
[![Build status](https://ci.appveyor.com/api/projects/status/x11q4sv1haoubo1b/branch/master?svg=true)](https://ci.appveyor.com/project/ballwood/node-sauce-connect)
[![Code Climate](https://api.codeclimate.com/v1/badges/9b31ff58b6cf0780e930/maintainability)](https://codeclimate.com/github/ballwood/node-sauce-connect/maintainability)
[![npm](https://img.shields.io/npm/dt/node-sauce-connect.svg)](https://www.npmjs.com/package/node-sauce-connect)
[![npm version](https://badge.fury.io/js/node-sauce-connect.svg)](https://badge.fury.io/js/node-sauce-connect)

# Node Sauce Connect

Note
-----------------------
The reason for creating this package was I'm working in an enterprise environment and I wanted a 
simple way to grab sauce connect from a local nexus repository on npm install. 
sauce-connect-launcher does this but felt extremely heavyweight and there was no 
way to specify where to download from.

Installing
-----------------------

```shell
npm install node-sauce-connect
```

### Custom Binary Download Url

To use a mirror of the Sauce Connect binaries use npm config property `sauceconnect_cdnurl`.
Default is `https://saucelabs.com/downloads`.

```shell
npm install node-sauce-connect --sauceconnect_cdnurl=https://your.url/sauceconnect
```

Or add property into your [`.npmrc`](https://docs.npmjs.com/files/npmrc) file.

```
sauceconnect_cdnurl=https://your.url/sauceconnect
```

### Custom Certificate Authority

Sometimes on internal networks certificates are self signed by the organization 
which causes errors when downloading. You can use the the following 
[`.npmrc`](https://docs.npmjs.com/files/npmrc) config settings 
to force node-sauce-connect to trust these certificate authorities.
   
```
cafile=/path/to/certificate.crt
```

You can also provide the certificate as a string to node-sauce-connect by
using the ca setting

```
ca="-----BEGIN CERTIFICATE-----\nMIID0zCCArugAwIBAgI...."
```

### Disable Strict SSL Mode

Strict SSL environment variables are also respected, this means node-sauce-connect 
will ignore any SSL errors that are thrown when downloading when the strict-ssl 
property is in your [`.npmrc`](https://docs.npmjs.com/files/npmrc) file. 

```
strict-ssl=false
```

### Obfuscation of HTTP(S)_PROXY basic auth

On install node-sauce-connect will log out the `HTTP_PROXY` and `HTTPS_PROXY` env vars
to help in debugging. By default it obfuscates the username and password. If you require
to see what is being used then 

```shell
npm install node-sauce-connect --node_sauce_connect_debug=TRUE
```

Or add property into your [`.npmrc`](https://docs.npmjs.com/files/npmrc) file.

```
node_sauce_connect_debug=TRUE
```

Running
-------

```shell
bin/sc [arguments]
```

If installed via npm there will be a symlink placed in `node_modules/.bin`
you can execute by placing the following in your `package.json` file.

````json
{
    "scripts": {
      "test": "npm run sc && [test util]",
      "sc": "sc [arguments]"
    }
}
````

Running via Node
----------------

The package exports a `path` string that contains the path to the
Sauce Connect binary/executable.

Below is an example of using this package via node.

```javascript
var childProcess = require('child_process');
var sauceConnect = require('node-sauce-connect');
var binPath = sauceConnect.path;

var childArgs = [
    // optional arguments
];

function logger(data) {
  console.log(data);
}

var instance = childProcess.spawn(binPath, childArgs);

instance.stdout.on('data', logger);                   
instance.on('data', logger);

// run your tests

instance.kill();

```

You can also use the start and stop methods for convenience (this only works for one instance):

```javascript
var sauceConnect = require('node-sauce-connect');

args = [
	// optional arguments
];

function logger(data) {
  console.log(data);
}

sauceConnect.start(args);

sauceConnect.defaultInstance.stdout.on('data', logger);                   
sauceConnect.defaultInstance.on('data', logger);

// run your tests

sauceConnect.stop();

```
Note: if your tests are ran asynchronously, sauceConnect.stop() will have to be
executed as a callback at the end of your tests.

Versioning
----------

The NPM package version tracks the version of Sauce Connect that will be installed,
there is also the possibility of an additional number (eg. 4.5.51) that will be used 
used for revisions to the installer.

Node Version Support
----------

The package has been tested with latest versions of Node 4, 5, 6, 7, 8 and 9.

Author
------

[Barry Allwood](https://github.com/ballwood)

This project is completely inspired by and borrows heavily from the 
[chromedriver](https://github.com/giggio/node-chromedriver) project (even the readme)
and [sauce-connect-launcher](https://github.com/bermi/sauce-connect-launcher) project. 

License
-------

Licensed under the Apache License, Version 2.0.
