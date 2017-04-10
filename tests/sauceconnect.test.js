var lib = require('../lib/lib');
var sauceConnect = require('../lib/sauceconnect');
var expect = require('chai').expect;
var packageJson = require('../package.json');
var path = require('path');
var childProcess = require('child_process');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('sauceconnect.js', function () {
  var executableName = lib.getLocalFilename(process.platform);
  var executablePath = path.normalize(path.join(__dirname, '../lib/', executableName));

  describe('path', function () {

    it('should return the path to the sauce connect executable', function () {
      expect(sauceConnect.path).to.equal(executablePath);
    });

  });

  describe('version', function () {

    it('should return the version described in package.json', function () {
      expect(sauceConnect.version).to.equal(packageJson.version);
    });

  });

  describe('start', function () {

    it('should execute the sauce connect executable', function () {
      sinon.stub(childProcess, 'execFile');

      sauceConnect.start();

      expect(childProcess.execFile).to.have.been.calledWith(executablePath);

      childProcess.execFile.restore();

    });

    it('should pass any arguments to the sauce connect array', function () {
      var args = ['a', 'b', 'c'];

      sinon.stub(childProcess, 'execFile');

      sauceConnect.start(args);

      expect(childProcess.execFile).to.have.been.calledWith(executablePath, args);

      childProcess.execFile.restore();

    });

  });

  describe('stop', function () {

    it('should not error if sauce connect is not started', function () {
      sauceConnect.stop();
    });

    it('should kill sauce connect if instance exists', function () {

      var mock = {
        kill: sinon.spy()
      };

      sinon.stub(childProcess, 'execFile').returns(mock);

      sauceConnect.start();
      sauceConnect.stop();

      expect(mock.kill).to.have.been.called;

      childProcess.execFile.restore();

    });

  });

});
