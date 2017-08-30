var installer = require('../lib/installer');
var lib = require('../lib/lib');
var httpsRequest = require('../lib/httpsRequest');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Promise = require('yaku');
chai.use(sinonChai);

describe('installer.js', function () {
  var fakeRequest = function () {};
  var fakeTarGzFilename = 'sc.tar.gz';
  var fakePath = '/a/test/path/';
  var fakeExecutablePath = '/a/test/path/sc';
  var fakeNodeModulesPath = '/a/project/node_modules/sc';
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
    var httpsRequestCreateStub;
    var wrapWithProgressStub;
    var loggerStub;

    beforeEach(function () {
      getDownloadFilenameStub = sinon.stub(lib, 'getDownloadFilename');
      getDownloadUrlStub = sinon.stub(lib, 'getDownloadUrl');
      getArchStub = sinon.stub(lib, 'getDownloadArch');
      getChecksumStub = sinon.stub(lib, 'getChecksum');
      httpsRequestCreateStub = sinon.stub(httpsRequest, 'create');
      wrapWithProgressStub = sinon.stub(httpsRequest, 'wrapWithProgress');

      loggerStub = sinon.stub();
      sinon.stub(lib, 'createTmpDir').returns(Promise.resolve(fakePath));
      sinon.stub(lib, 'download').returns(Promise.resolve(fakePath + fakeTarGzFilename));
      sinon.stub(lib, 'verifyFileChecksum').returns(Promise.resolve(fakePath + fakeTarGzFilename));
      sinon.stub(lib, 'extract').returns(Promise.resolve(fakeExecutablePath));
      sinon.stub(lib, 'moveToLib').returns(Promise.resolve(fakeNodeModulesPath));
      sinon.stub(lib, 'setExecutePermissions').returns(Promise.resolve(fakeNodeModulesPath));
      sinon.stub(lib, 'obfuscateAuthInUri');
    });

    afterEach(function () {
      getDownloadFilenameStub.restore();
      getDownloadUrlStub.restore();
      getArchStub.restore();
      getChecksumStub.restore();
      httpsRequestCreateStub.restore();
      wrapWithProgressStub.restore();

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

      return promise;

    });

    describe('when ssl env vars aren\'t set', function () {

      beforeEach(function () {
        delete process.env.npm_config_cafile;
        delete process.env.npm_config_ca;
        delete process.env.npm_config_strict_ssl;
      });

      it('should pass undefined to httpsRequest', function () {
        var promise;

        promise = installer.install(loggerStub, cdn, platform, arch);

        expect(httpsRequestCreateStub).to.have.been.calledWith(
          undefined,
          undefined,
          undefined
        );

        return promise;

      });

    });

    describe('when ssl env vars are set', function () {

      beforeEach(function () {
        process.env.npm_config_cafile = 'test1';
        process.env.npm_config_ca = 'test2';
        process.env.npm_config_strict_ssl = 'false';
      });

      afterEach(function () {
        delete process.env.npm_config_cafile;
        delete process.env.npm_config_ca;
        delete process.env.npm_config_strict_ssl;
      });

      it('should pass them correctly to httpsRequest', function () {
        var promise;

        promise = installer.install(loggerStub, cdn, platform, arch);

        expect(httpsRequestCreateStub).to.have.been.calledWith(
          process.env.npm_config_strict_ssl,
          process.env.npm_config_cafile,
          process.env.npm_config_ca
        );

        return promise;

      });

    });

    it('should wrap httpsRequest with progress event handlers', function () {

      var promise;

      httpsRequestCreateStub.returns(fakeRequest);

      promise = installer.install(loggerStub, cdn, platform, arch);

      expect(wrapWithProgressStub).to.have.been.calledWith(fakeRequest);

      return promise;

    });

    it('should call download with getDownloadUrl and getDownloadFilename results', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getDownloadUrlStub.returns(cdn);
      getChecksumStub.returns(fakeChecksum);
      wrapWithProgressStub.returns(fakeRequest);

      promise = installer.install(loggerStub, cdn, platform, arch).then(function () {

        expect(lib.download).to.have.been.calledWith(
          loggerStub,
          fakeRequest,
          cdn,
          fakePath);

      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should call verifyFileChecksum with sha1, the checksum and the file path', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getChecksumStub.returns(fakeChecksum);
      getDownloadUrlStub.returns(cdn);

      promise = installer.install(loggerStub, cdn, platform, arch).then(function () {
        expect(lib.verifyFileChecksum)
          .to.have.been.calledWith('sha1', fakeChecksum, fakePath + fakeTarGzFilename);
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should call extract with the correct file path', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getChecksumStub.returns(fakeChecksum);
      getDownloadUrlStub.returns(cdn);

      promise = installer.install(loggerStub, cdn, platform, arch).then(function () {
        expect(lib.extract)
          .to.have.been.calledWith(loggerStub, sinon.match.any, fakePath + fakeTarGzFilename);
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should call moveToLib with the correct file path', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getChecksumStub.returns(fakeChecksum);
      getDownloadUrlStub.returns(cdn);

      promise = installer.install(loggerStub, cdn, platform, arch).then(function () {
        expect(lib.moveToLib)
          .to.have.been.calledWith(loggerStub, fakeExecutablePath);
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });


    it('should call setExecutePermissions with the platform & moved file passed in', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getDownloadUrlStub.returns(cdn);

      promise = installer.install(loggerStub, cdn, platform, arch).then(function () {
        expect(lib.setExecutePermissions)
        .to.have.been.calledWith(loggerStub, platform, fakeNodeModulesPath);
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
