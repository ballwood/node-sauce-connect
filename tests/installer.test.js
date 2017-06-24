var installer = require('../lib/installer');
var lib = require('../lib/lib');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Promise = require('yaku');
chai.use(sinonChai);

describe('installer.js', function () {
  var fakeTarGzFilename = 'sc.tar.gz';
  var cdn = 'http://somecdn.com/saucelabs/';
  var platform = 'darwin';
  var arch = 'x64';
  var manifestIndex = 'osx';
  var fakeChecksum = 'e2d999c4470d1e7d73a1a24d75190b3b8ded1045';

  describe('install', function () {

    var getDownloadFilenameStub;
    var getDownloadUrlStub;
    var getArchStub;
    var getChecksumStub;
    var loggerStub;

    beforeEach(function () {
      getDownloadFilenameStub = sinon.stub(lib, 'getDownloadFilename');
      getDownloadUrlStub = sinon.stub(lib, 'getDownloadUrl');
      getArchStub = sinon.stub(lib, 'getDownloadArch');
      getChecksumStub = sinon.stub(lib, 'getChecksum');

      loggerStub = sinon.stub();
      sinon.stub(lib, 'createTmpDir').returns(Promise.resolve());
      sinon.stub(lib, 'download').returns(Promise.resolve());
      sinon.stub(lib, 'verifyFileChecksum').returns(Promise.resolve());
      sinon.stub(lib, 'extract').returns(Promise.resolve());
      sinon.stub(lib, 'moveToLib').returns(Promise.resolve());
      sinon.stub(lib, 'setExecutePermissions').returns(Promise.resolve());
      sinon.stub(lib, 'obfuscateAuthInUri');
    });

    afterEach(function () {
      getDownloadFilenameStub.restore();
      getDownloadUrlStub.restore();
      getArchStub.restore();
      getChecksumStub.restore();

      lib.createTmpDir.restore();
      lib.download.restore();
      lib.extract.restore();
      lib.moveToLib.restore();
      lib.verifyFileChecksum.restore();
      lib.setExecutePermissions.restore();
      lib.obfuscateAuthInUri.restore();
    });

    it('should call getDownloadFilename with correct platform, arch and lib', function () {
      var promise;

      getArchStub.returns(manifestIndex);

      promise = installer.install(loggerStub, cdn, platform, arch);

      expect(getDownloadFilenameStub).to.have.been.calledWith(manifestIndex);

      return promise;

    });

    it('should call getDownloadUrl with cdn and filename from result of getDownloadFileName', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);

      promise = installer.install(loggerStub, cdn, platform, arch);

      expect(getDownloadUrlStub).to.have.been.calledWith(cdn, fakeTarGzFilename);

      lib.getDownloadUrl.restore();
      lib.getDownloadFilename.restore();

      return promise;

    });

    it('should call download with getDownloadUrl and getDownloadFilename results', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getDownloadUrlStub.returns(cdn);
      getChecksumStub.returns(fakeChecksum);

      promise = installer.install(loggerStub, cdn, platform, arch).then(function () {

        expect(lib.download).to.have.been.calledWith(
          loggerStub,
          sinon.match.any,
          cdn,
          sinon.match.any);

      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should call verifyFileChecksum with the correct file path', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getChecksumStub.returns(fakeChecksum);
      getDownloadUrlStub.returns(cdn);

      promise = installer.install(loggerStub, cdn, platform, arch).then(function () {
        expect(lib.verifyFileChecksum)
          .to.have.been.calledWith('sha1', fakeChecksum, sinon.match.any);
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should call setExecutePermissions with the platform passed in', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getDownloadUrlStub.returns(cdn);

      promise = installer.install(loggerStub, cdn, platform, arch).then(function () {
        expect(lib.setExecutePermissions)
        .to.have.been.calledWith(loggerStub, platform, sinon.match.any);
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should call all of the functions required to download the binary', function () {

      var promise = installer.install(loggerStub, cdn, platform, arch).then(function () {
        expect(lib.createTmpDir).to.have.been.called;
        expect(lib.download).to.have.been.called;
        expect(lib.extract).to.have.been.called;
        expect(lib.moveToLib).to.have.been.called;
        expect(lib.setExecutePermissions).to.have.been.called;
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should call obfuscateAuthInUri and pass to logger if debug param is false', function () {

      var url = 'https://****:****@google.com';
      var promise;

      lib.obfuscateAuthInUri.returns(url);

      promise = installer.install(loggerStub, cdn, platform, arch, false).then(function () {
        expect(lib.obfuscateAuthInUri).to.have.been.calledTwice;
        expect(loggerStub).to.have.been.calledWith('HTTP Proxy:', url);
        expect(loggerStub).to.have.been.calledWith('HTTPS Proxy:', url);
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should not call obfuscateAuthInUri if debug param is true', function () {

      var promise;

      promise = installer.install(loggerStub, cdn, platform, arch, true).then(function () {
        expect(lib.obfuscateAuthInUri).not.to.have.been.calledTwice;
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

  });

});
