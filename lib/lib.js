var util = require('util');
var packageVersion = require('../version');
var Promise = require('yaku');
var fs = require('fs-extra');
var path = require('path');
var url = require('url');

function getPackageVersion() {
  return packageVersion;
}

function obfuscateAuthInUri(uri) {

  var parsedPath;

  if (!uri) return '';

  parsedPath = url.parse(uri);

  if (parsedPath.auth) {
    parsedPath.auth = '****:****';
  }

  return url.format(parsedPath);

}

function getDownloadArch(platform, arch) {

  if (platform === 'linux') {

    if (arch === 'x64') {
      return 'linux';
    } else if (arch === 'ia32') {
      return 'linux32';
    }

  } else if (platform === 'darwin') {

    if (arch === 'x64') {
      return 'osx';
    }

    throw new Error('Only Mac 64 bits supported.');

  } else if (platform === 'win32') {
    return 'win32';
  }

  throw new Error('Unexpected platform or architecture: ' + platform + ' ' + arch);

}

function getDownloadFilename(platform, arch, version) {

  var ext;
  var archName = getDownloadArch(platform, arch);

  if (platform === 'linux') {
    ext = 'tar.gz';
  } else {
    ext = 'zip';
  }

  return util.format('sc-%s-%s.%s', version, archName, ext);
}

function getLocalFilename(platform) {
  if (platform === 'win32') {
    return 'sc.exe';
  }
  return 'sc';
}

function getDownloadUrl(cdnUrl, filename) {

  var downloadUrl;

  if (!filename) throw new Error('No filename specified');

  downloadUrl = cdnUrl || 'https://saucelabs.com/downloads';

  // strip trailing slash
  downloadUrl = downloadUrl && downloadUrl.replace(/\/+$/, '');

  return downloadUrl + '/' + filename;
}

function createTmpDir(logger) {

  var sauceTmpDir = path.join(__dirname, 'sauceconnect');

  return new Promise(function (resolve, reject) {

    fs.ensureDir(sauceTmpDir, function (err) {
      if (err) return reject(new Error(err));

      logger('Created temporary directory:', sauceTmpDir);

      return resolve(sauceTmpDir);

    });

  });

}

function download(logger, requestLib, uri, filename, directory) {

  var localPath = path.join(directory, filename);
  logger('Downloading to path:', localPath);
  logger('Using cdn url:', uri);

  return new Promise(function (resolve, reject) {

    requestLib(uri)
      .on('error', function (err) {
        reject(new Error(err));
      })
      .on('progress', function (state) {
        logger('Received ' + Math.floor(state.size.transferred / 1024) + 'K...');
      })
      .pipe(fs.createWriteStream(localPath))
      .on('error', function (err) {
        reject(new Error(err));
      })
      .on('finish', function () {
        resolve(localPath);
      });

  });
}

function extract(logger, compressionLib, file) {

  // get current dir
  var zipPath = path.parse(file);

  // fix for path.parse not removing .tar in .tar.gz
  var removeTar = zipPath.name.replace('.tar', '');

  // don't use path.join here as decompress
  // only reports unix paths so won't match
  var binDir = removeTar + '/bin';

  return compressionLib(file, zipPath.dir).then(function (filesInZip) {

    var scFiles;
    var outputLocation;
    var sauceConnectBinary;

    scFiles = filesInZip.filter(function (fileInZip) {
      var parsedPath = path.parse(fileInZip.path);
      return parsedPath.dir === binDir && fileInZip.type === 'file' && parsedPath.name === 'sc';
    });

    if (scFiles.length !== 1) {
      return Promise.reject(new Error('Could not find sauce connect executable in zip file'));
    }

    // only file should be binary
    sauceConnectBinary = scFiles[0];

    outputLocation = path.join(zipPath.dir, sauceConnectBinary.path);

    logger('Found sauce connect binary in compressed file:', sauceConnectBinary.path);
    logger('Extracting to:', outputLocation);

    return outputLocation;

  }).catch(function (error) {

    if (typeof error === 'string') {

      // some libraries may not reject
      // with an error so convert into one

      throw new Error(error);

    } else if (error instanceof Error) {

      // rethrow previous error

      throw error;

    }

    // something else in the rejection
    // just return a generic error

    throw new Error('Unable to extract from ' + file);

  });

}

function moveToLib(logger, filePath) {

  return new Promise(function (resolve, reject) {

    var parsedPath = path.parse(filePath);
    var newLocation = path.join(__dirname, parsedPath.name + parsedPath.ext);

    logger('Moving sauce connect binary to:', newLocation);

    fs.move(filePath, newLocation, { overwrite: true }, function (err) {
      if (err) return reject(new Error(err));
      return resolve(newLocation);
    });

  });

}

function setExecutePermissions(logger, platform, filePath) {

  if (!filePath) throw new Error('No file path specified');

  return new Promise(function (resolve, reject) {

    if (platform === 'win32') {
      // No need to set permission for the executable on Windows
      resolve(filePath);
    } else {
      // check current permissions
      fs.stat(filePath, function (statErr, stat) {

        if (statErr) return reject(new Error('Couldn\'t read sc permissions: ' + statErr.message));

        if (stat.mode.toString(8) !== '100755') {

          return fs.chmod(filePath, '0755', function (chmodErr) {
            if (chmodErr) return reject(new Error('Couldn\'t set permissions: ' + chmodErr.message));

            logger('Set execute permissions for file:', filePath);

            return resolve(filePath);
          });

        }

        return resolve(filePath);

      });
    }

  });

}

module.exports = {
  obfuscateAuthInUri: obfuscateAuthInUri,
  getDownloadUrl: getDownloadUrl,
  getLocalFilename: getLocalFilename,
  getDownloadArch: getDownloadArch,
  getDownloadFilename: getDownloadFilename,
  getPackageVersion: getPackageVersion,
  setExecutePermissions: setExecutePermissions,
  download: download,
  moveToLib: moveToLib,
  extract: extract,
  createTmpDir: createTmpDir
};
