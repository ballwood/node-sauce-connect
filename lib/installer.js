var progress = require('request-progress');
var decompress = require('decompress');
var lib = require('./lib');
var httpsRequest = require('./httpsRequest');

function progressRequest(request, uri) {
  return progress(request(uri));
}

function install(logger, cdn, platform, arch, debug) {

  var archIndex = lib.getDownloadArch(platform, arch);

  var filename = lib.getDownloadFilename(archIndex);
  var checksum = lib.getChecksum(archIndex);

  var archiveUrl = lib.getDownloadUrl(cdn, filename);

  var httpProxy = process.env.http_proxy || process.env.HTTP_PROXY || '';
  var httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY || '';
  var noProxy = process.env.no_proxy || process.env.NO_PROXY || '';
  var strictSSL = process.env.npm_config_strict_ssl || '';
  var ca = process.env.npm_config_ca || '';
  var caFile = process.env.npm_config_cafile || '';

  var https = httpsRequest(strictSSL, caFile, ca);

  if (!debug) {
    httpProxy = lib.obfuscateAuthInUri(httpProxy);
    httpsProxy = lib.obfuscateAuthInUri(httpsProxy);
  }

  logger('HTTP Proxy:', httpProxy);
  logger('HTTPS Proxy:', httpsProxy);
  logger('No Proxy:', noProxy);
  logger('Strict SSL:', strictSSL);
  logger('CA File:', caFile);
  logger('Installing Sauce Connect for:');
  logger('Platform', platform);
  logger('Arch', arch);

  return lib.createTmpDir(logger)
    .then(lib.download.bind(this, logger, progressRequest.bind(this, https), archiveUrl))
    .then(lib.verifyFileChecksum.bind(this, 'sha1', checksum))
    .then(lib.extract.bind(this, logger, decompress))
    .then(lib.moveToLib.bind(this, logger))
    .then(lib.setExecutePermissions.bind(this, logger, platform));

}

module.exports = {
  install: install
};
