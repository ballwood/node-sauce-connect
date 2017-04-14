var lib = require('../lib/lib');
var path = require('path');
var fs = require('fs-extra');
var stream = require('stream');
var chai = require('chai');
var expect = chai.expect;
var os = require('os');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Promise = require('yaku');
chai.use(sinonChai);

describe('lib.js', function () {
  var fakeZipFilename = 'sc.zip';
  var fakeTarGzFilename = 'sc.tar.gz';
  var fakePath = '/a/test/path/';
  var fakeZipPath = path.join(fakePath, fakeZipFilename);
  var fakeTarGzPath = path.join(fakePath, fakeTarGzFilename);

  describe('obfuscateAuthInUri', function () {

    it('should handle a blank uri', function () {

      var result = lib.obfuscateAuthInUri('');

      expect(result).to.equal('');

    });

    it('should obfuscate auth in uri correctly', function () {

      var result = lib.obfuscateAuthInUri('http://xxx:yyy@google.com/');

      expect(result).to.equal('http://****:****@google.com/');

    });

    it('should not touch a uri without auth', function () {

      var result = lib.obfuscateAuthInUri('http://google.com/');

      expect(result).to.equal('http://google.com/');

    });

  });

  describe('getDownloadArch', function () {

    describe('when platform is linux', function () {
      var platform = 'linux';

      it('should return linux when arch is x64', function () {
        expect(lib.getDownloadArch(platform, 'x64')).to.equal('linux');
      });

      it('should return linux32 when arch is ia32', function () {
        expect(lib.getDownloadArch(platform, 'ia32')).to.equal('linux32');
      });

      it('should throw an exception when arch is anything else', function () {
        expect(lib.getDownloadArch.bind(platform, 'zzz')).to.throw(Error);
      });

    });

    describe('when platform is darwin', function () {
      var platform = 'darwin';

      it('should return osx when arch is x64', function () {
        expect(lib.getDownloadArch(platform, 'x64')).to.equal('osx');
      });

      it('should throw an exception when arch is anything else', function () {
        expect(lib.getDownloadArch.bind(platform, 'zzz')).to.throw(Error);
      });

    });

    describe('when platform is win32', function () {
      var platform = 'win32';

      it('should return win32', function () {
        expect(lib.getDownloadArch(platform)).to.equal('win32');
      });

    });

  });

  describe('getDownloadFilename', function () {
    var version = '1.0.0';

    describe('when platform is linux', function () {
      var platform = 'linux';

      it('should return sc-1.0.0-linux.tar.gz when arch is x64', function () {
        expect(lib.getDownloadFilename(platform, 'x64', version)).to.equal('sc-1.0.0-linux.tar.gz');
      });

      it('should return sc-1.0.0-linux32.tar.gz when arch is x86', function () {
        expect(lib.getDownloadFilename(platform, 'ia32', version)).to.equal('sc-1.0.0-linux32.tar.gz');
      });

      it('should throw an exception when arch is anything else', function () {
        expect(lib.getDownloadFilename.bind(platform, 'zzz', version)).to.throw(Error);
      });

    });

    describe('when platform is darwin', function () {
      var platform = 'darwin';

      it('should return osx when arch is x64', function () {
        expect(lib.getDownloadFilename(platform, 'x64', version)).to.equal('sc-1.0.0-osx.zip');
      });

      it('should throw an exception when arch is anything else', function () {
        expect(lib.getDownloadFilename.bind(platform, 'zzz', version)).to.throw(Error);
      });

    });

    describe('when platform is win32', function () {
      var platform = 'win32';

      it('should return sc-1.0.0-win32.zip', function () {
        expect(lib.getDownloadFilename(platform, 'x64', version)).to.equal('sc-1.0.0-win32.zip');
      });

    });

  });

  describe('getLocalFilename', function () {

    it('should return sc.exe when platform is win32', function () {
      expect(lib.getLocalFilename('win32')).to.equal('sc.exe');
    });

    it('should return sc when platform is anything else', function () {
      expect(lib.getLocalFilename('osx')).to.equal('sc');
    });

  });

  describe('getDownloadUrl', function () {

    it('should throw an exception when filename is undefined', function () {
      expect(lib.getDownloadUrl.bind('')).to.throw(Error);
    });

    it('should throw an exception when filename is empty string', function () {
      expect(lib.getDownloadUrl.bind('', '')).to.throw(Error);
    });

    it('should throw an exception when filename is null', function () {
      expect(lib.getDownloadUrl.bind('', null)).to.throw(Error);
    });

    it('should use cdnUrl if not undefined', function () {
      expect(lib.getDownloadUrl('http://www.google.com/', 'file.exe')).to.equal('http://www.google.com/file.exe');
    });

    it('should use the default saucelabs url if cdnUrl is undefined', function () {
      expect(lib.getDownloadUrl('', 'file.exe')).to.equal('https://saucelabs.com/downloads/file.exe');
    });

  });


  describe('createTmpDir', function () {
    var tmpDir = path.join(os.tmpdir(), 'sauceconnect');
    var loggerStub;
    var ensureDirStub;

    beforeEach(function () {
      ensureDirStub = sinon.stub(fs, 'ensureDir');
      loggerStub = sinon.stub();
    });

    afterEach(function () {
      fs.ensureDir.restore();
    });

    it('should create sauceconnect in the temp directory', function () {

      lib.createTmpDir(loggerStub);

      expect(ensureDirStub).to.have.been.calledWith(tmpDir, sinon.match.func);

    });

    it('should resolve if directory created', function () {

      ensureDirStub.callsFake(function (x, callback) {
        callback();
      });

      return lib.createTmpDir(loggerStub).then(function (dirName) {
        expect(dirName).to.equal(tmpDir);
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

    });

    it('should reject if directory not created', function () {

      ensureDirStub.callsFake(function (x, callback) {
        callback('error');
      });

      return lib.createTmpDir(loggerStub).then(function () {
        throw new Error('was not supposed to resolve');
      }).catch(function (error) {
        expect(error).to.be.a('Error');
      });

    });

  });

  describe('download', function () {
    var fakeUrl = 'https://www.google.com';
    var requestStub;
    var loggerStub;
    var fakeRequestStream;
    var fakeFsStream;

    beforeEach(function () {
      fakeRequestStream = new stream.Readable();
      fakeRequestStream._read = sinon.stub();
      fakeRequestStream.write = sinon.stub();
      fakeFsStream = new stream.Readable();
      fakeFsStream._read = sinon.stub();
      fakeFsStream.write = sinon.stub();
      sinon.stub(fs, 'createWriteStream').returns(fakeFsStream);
      requestStub = sinon.stub().returns(fakeRequestStream);
      loggerStub = sinon.stub();
    });

    afterEach(function () {
      fs.createWriteStream.restore();
    });

    it('should call the request library with the correct url', function () {

      var promise = lib.download(loggerStub, requestStub, fakeUrl, fakeTarGzFilename, fakePath);
      fakeFsStream.emit('finish');

      expect(requestStub).to.have.been.calledWith(fakeUrl);

      return promise;

    });

    it('should reject on http error', function () {

      var promise = lib.download(loggerStub, requestStub, fakeUrl, fakeTarGzFilename, fakePath)
        .then(function () {
          throw new Error('was not supposed to resolve');
        }).catch(function (error) {
          expect(error).to.be.a('Error');
        });

      fakeRequestStream.emit('error');

      return promise;

    });

    it('should pass data from the request response to the file stream', function () {
      var data = 'test';

      var promise = lib.download(loggerStub, requestStub, fakeUrl, fakeTarGzFilename, fakePath)
        .then(function () {
          throw new Error('was not supposed to resolve');
        }).catch(function (error) {
          expect(error).to.be.a('Error');
        });

      fakeRequestStream.emit('data', data);
      fakeFsStream.emit('finish');

      expect(fakeFsStream.write).to.have.been.calledWith(data);

      return promise;

    });

    it('should reject on writing to filesystem error', function () {

      var promise = lib.download(loggerStub, requestStub, fakeUrl, fakeTarGzFilename, fakePath)
        .then(function () {
          throw new Error('was not supposed to resolve');
        }).catch(function (error) {
          expect(error).to.be.a('Error');
        });

      fakeFsStream.emit('error');

      return promise;

    });

    it('should resolve with local filename when finished writing', function () {

      var expectedOutputPath = path.join(fakePath, fakeTarGzFilename);

      var promise = lib.download(loggerStub, requestStub, fakeUrl, fakeTarGzFilename, fakePath)
        .then(function (filename) {
          expect(filename).to.equal(expectedOutputPath);
        }).catch(function () {
          throw new Error('was not supposed to reject');

        });

      fakeFsStream.emit('finish');

      return promise;

    });

  });

  describe('extract', function () {
    var decompressStub;
    var loggerStub;

    beforeEach(function () {
      decompressStub = sinon.stub();
      loggerStub = sinon.stub();
    });

    it('should reject if it cannot decompress the archive', function () {

      decompressStub.returns(Promise.reject('Error'));

      return lib.extract(loggerStub, decompressStub, fakeZipPath).then(function () {
        throw new Error('was not supposed to resolve');
      }).catch(function (error) {
        expect(error).to.be.a('Error');
      });

    });

    it('should not include the tar.gz extension in the result', function () {
      var decompressionResult = [{
        path: 'sc/bin/sc',
        type: 'file',
        name: 'sc'
      }];

      decompressStub.returns(Promise.resolve(decompressionResult));

      return lib.extract(loggerStub, decompressStub, fakeTarGzPath).then(function (result) {
        expect(result).to.equal(path.join(fakePath, 'sc/bin/sc'));
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });
    });

    it('should reject if it cannot find the sauce connect file', function () {
      var decompressionResult = [];

      decompressStub.returns(Promise.resolve(decompressionResult));

      return lib.extract(loggerStub, decompressStub, fakeZipPath).then(function () {
        throw new Error('was not supposed to resolve');
      }).catch(function (error) {
        expect(error).to.be.a('Error');
      });

    });

    it('should resolve with the extracted binary location if it finds the binary', function () {
      var decompressionResult = [{
        path: 'sc/bin/sc',
        type: 'file',
        name: 'sc'
      },
      {
        path: 'sc',
        type: 'directory',
        name: 'bin'
      }];

      decompressStub.returns(Promise.resolve(decompressionResult));

      return lib.extract(loggerStub, decompressStub, fakeZipPath).then(function (result) {
        expect(result).to.equal(path.join(fakePath, 'sc/bin/sc'));
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });
    });

  });

  describe('moveToLib', function () {
    var resultLocation = path.normalize(path.join(__dirname, '../lib/sc.zip'));
    var moveStub;
    var loggerStub;

    beforeEach(function () {
      moveStub = sinon.stub(fs, 'move');
      loggerStub = sinon.stub();
    });

    afterEach(function () {
      fs.move.restore();
    });

    it('should move the file to the lib directory', function () {

      lib.moveToLib(loggerStub, fakeZipPath);

      expect(moveStub).to.have.been.calledWith(
        fakeZipPath,
        resultLocation,
        { overwrite: true },
        sinon.match.func);

    });

    it('should resolve if file moved successfully', function () {

      moveStub.callsFake(function (oldPath, newPath, settings, callback) {
        callback();
      });

      return lib.moveToLib(loggerStub, fakeZipPath).then(function (dirName) {
        expect(dirName).to.equal(resultLocation);
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

    });

    it('should reject if file not moved successfully', function () {

      moveStub.callsFake(function (oldPath, newPath, settings, callback) {
        callback('error');
      });

      return lib.moveToLib(loggerStub, fakeZipPath).then(function () {
        throw new Error('was not supposed to resolve');
      }).catch(function (error) {
        expect(error).to.be.a('Error');
      });

    });

  });

  describe('setExecutePermissions', function () {
    var statStub;
    var chmodStub;
    var loggerStub;

    beforeEach(function () {
      loggerStub = sinon.stub();
      statStub = sinon.stub(fs, 'stat');
      chmodStub = sinon.stub(fs, 'chmod');
    });

    afterEach(function () {
      fs.stat.restore();
      fs.chmod.restore();
    });

    describe('when the platform is windows', function () {

      it('should not set permissions', function () {
        return lib.setExecutePermissions(loggerStub, 'win32', fakeZipPath).then(function (result) {
          expect(fs.stat).not.to.have.been.called;
          expect(fs.chmod).not.to.have.been.called;
          expect(result).to.equal(fakeZipPath);
        }).catch(function () {
          throw new Error('was not supposed to reject');
        });
      });

    });

    describe('when the platform is not windows', function () {

      it('should reject if stat fails', function () {

        statStub.callsFake(function (filePath, callback) {
          callback('error');
        });

        return lib.setExecutePermissions(loggerStub, 'osx', fakeZipPath).then(function () {
          throw new Error('was not supposed to resolve');
        }).catch(function (error) {
          expect(error).to.be.a('Error');
        });

      });

      it('should not execute chmod and resolve if permissions are already 0755', function () {

        var statResult = {
          mode: '100755'
        };

        statStub.callsFake(function (filePath, callback) {
          callback(undefined, statResult);
        });

        return lib.setExecutePermissions(loggerStub, 'osx', fakeZipPath).then(function (filePath) {
          expect(statStub).to.have.been.calledWith(fakeZipPath, sinon.match.func);
          expect(chmodStub).not.to.have.been.called;
          expect(filePath).to.equal(fakeZipPath);
        }).catch(function () {
          throw new Error('was not supposed to reject');
        });

      });

      it('should set the file permissions correctly and resolve', function () {

        var statResult = {
          mode: '1000644'
        };

        statStub.callsFake(function (filePath, callback) {
          callback(undefined, statResult);
        });

        chmodStub.callsFake(function (filePath, permissions, callback) {
          callback();
        });

        return lib.setExecutePermissions(loggerStub, 'osx', fakeZipPath).then(function (filePath) {
          expect(chmodStub).to.have.been.calledWith(filePath, '0755', sinon.match.func);
          expect(filePath).to.equal(fakeZipPath);
        }).catch(function () {
          throw new Error('was not supposed to reject');
        });

      });

      it('should reject if chmod fails', function () {

        var statResult = {
          mode: '1000644'
        };

        statStub.callsFake(function (filePath, callback) {
          callback(undefined, statResult);
        });

        chmodStub.callsFake(function (filePath, permissions, callback) {
          callback();
        });

        return lib.setExecutePermissions(loggerStub, 'osx', fakeZipPath).then(function () {
          throw new Error('was not supposed to resolve');
        }).catch(function (error) {
          expect(error).to.be.a('Error');
        });

      });

    });

  });

});
