[![Build Status](https://travis-ci.org/ballwood/node-sauce-connect.svg?branch=master)](https://travis-ci.org/ballwood/node-sauce-connect)
[![Build status](https://ci.appveyor.com/api/projects/status/nmtio1a01a4cluvr?svg=true)](https://ci.appveyor.com/project/ballwood/node-sauce-connect)
[![npm](https://img.shields.io/npm/dt/node-sauce-connect.svg)](https://www.npmjs.com/package/node-sauce-connect)

# Node Sauce Connect

Note
-----------------------
This package is currently in beta status...use at your own peril! I plan to upgrade the CI
tests some more soon so I can prove everything runs correctly (proxies etc).

Installing
-----------------------

```shell
npm install node-sauce-connect
```

### Custom binaries url

To use a mirror of the Sauce Connect binaries use npm config property `sauceconnect_cdnurl`.
Default is `https://saucelabs.com/downloads`.

```shell
npm install node-sauce-connect --sauceconnect_cdnurl=https://your.url/sauceconnect
```

Or add property into your [`.npmrc`](https://docs.npmjs.com/files/npmrc) file.

```
sauceconnect_cdnurl=https://your.url/sauceconnect
```

Running
-------

```shell
bin/sc [arguments]
```

If installed via npm there will be a symlink placed in `node_modules/.bin`
you can execute by placing the following in your `package.json` file.

````json
"scripts": {
  "sc": "sc"
}
````

Running via node
----------------

The package exports a `path` string that contains the path to the
Sauce Connect binary/executable.

Below is an example of using this package via node.

```javascript
var childProcess = require('child_process');
var sauceConnect = require('node-sauce-connect');
var binPath = sauceConnect.path;

var childArgs = [
  'some argument'
];

childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
  // handle results
});

```

You can also use the start and stop methods:

```javascript
var sauceConnect = require('node-sauce-connect');

args = [
	// optional arguments
];
sauceConnect.start(args);
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

Author
------

[Barry Allwood](https://github.com/ballwood)

This project is completely inspired by and borrows heavily from the 
[chromedriver](https://github.com/giggio/node-chromedriver)project (even the readme, lol). 

The reason for creating it was I'm working in an enterprise environment and I wanted a 
simple way to grab sauce connect from a local nexus repository on npm install. 
sauce-connect-launcher does this but felt extremely heavyweight and there was no 
way to specify where to download from.

License
-------

Licensed under the Apache License, Version 2.0.
