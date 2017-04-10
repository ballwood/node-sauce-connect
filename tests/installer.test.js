var installer = require('../lib/installer');
var lib = require('../lib/lib');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Promise = require('yaku');
var packageJson = require('../package.json');
chai.use(sinonChai);

describe('installer.js', function () {
  var fakeTarGzFilename = 'sc.tar.gz';
  var cdn = 'http://somecdn.com/saucelabs/';
  var platform = 'darwin';
  var arch = 'x64';

  describe('install', function () {

    var getDownloadFilenameStub;
    var getDownloadUrlStub;

    beforeEach(function () {
      getDownloadFilenameStub = sinon.stub(lib, 'getDownloadFilename');
      getDownloadUrlStub = sinon.stub(lib, 'getDownloadUrl');
      sinon.stub(lib, 'createTmpDir').returns(Promise.resolve());
      sinon.stub(lib, 'download').returns(Promise.resolve());
      sinon.stub(lib, 'extract').returns(Promise.resolve());
      sinon.stub(lib, 'moveToLib').returns(Promise.resolve());
      sinon.stub(lib, 'setExecutePermissions').returns(Promise.resolve());
    });

    afterEach(function () {
      getDownloadFilenameStub.restore();
      getDownloadUrlStub.restore();
      lib.createTmpDir.restore();
      lib.download.restore();
      lib.extract.restore();
      lib.moveToLib.restore();
      lib.setExecutePermissions.restore();
    });

    it('should call getDownloadFilename with correct platform, arch and lib', function () {

      var promise;

      promise = installer.install(cdn, platform, arch);

      expect(getDownloadFilenameStub).to.have.been.calledWith(platform, arch, packageJson.version);

      getDownloadFilenameStub.restore();

      return promise;

    });

    it('should call getDownloadUrl with cdn and filename from result of getDownloadFileName', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);

      promise = installer.install(cdn, platform, arch);

      expect(getDownloadUrlStub).to.have.been.calledWith(cdn, fakeTarGzFilename);

      lib.getDownloadUrl.restore();
      lib.getDownloadFilename.restore();

      return promise;

    });

    it('should call download with getDownloadUrl and getDownloadFilename results', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getDownloadUrlStub.returns(cdn);

      promise = installer.install(cdn, platform, arch).then(function () {

        expect(lib.download).to.have.been.calledWith(
          sinon.match.any,
          cdn, fakeTarGzFilename,
          sinon.match.any);

      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should call setExecutePermissions with the platform passed in', function () {

      var promise;

      getDownloadFilenameStub.returns(fakeTarGzFilename);
      getDownloadUrlStub.returns(cdn);

      promise = installer.install(cdn, platform, arch).then(function () {
        expect(lib.setExecutePermissions).to.have.been.calledWith(platform, sinon.match.any);
      }).catch(function () {
        throw new Error('was not supposed to reject');
      });

      return promise;

    });

    it('should call all of the functions required to download the binary', function () {
      var promise;

      promise = installer.install(cdn, platform, arch).then(function () {
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

  });

});
