var path = require('path');
var lib = require('./lib');
var childProcess = require('child_process');

var sauceConnectFilename = lib.getLocalFilename(process.platform);

process.env.PATH += path.join(path.delimiter, __dirname);
exports.path = path.join(__dirname, sauceConnectFilename);
exports.version = lib.getPackageVersion();

exports.start = function (args) {
  exports.defaultInstance = childProcess.execFile(exports.path, args);
  return exports.defaultInstance;
};

exports.stop = function () {
  if (exports.defaultInstance) {
    exports.defaultInstance.kill();
  }
};
