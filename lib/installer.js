var lib = require('./lib');
var progress = require('request-progress');
var request = require('request');
var decompress = require('decompress');

function progressRequest(url) {
  return progress(request(url));
}

function install(cdn, platform, arch) {

  var filename = lib.getDownloadFilename(platform, arch, lib.getPackageVersion());
  var archiveUrl = lib.getDownloadUrl(cdn, filename);

  console.log('Installing Sauce Connect for:');
  console.log('Platform', platform);
  console.log('Arch', arch);

  return lib.createTmpDir()
    .then(lib.download.bind(this, progressRequest, archiveUrl, filename))
    .then(lib.extract.bind(this, decompress))
    .then(lib.moveToLib)
    .then(lib.setExecutePermissions.bind(this, platform));

}

module.exports = {
  install: install
};
