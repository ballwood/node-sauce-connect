var httpsRequest = require('../lib/httpsRequest');
var request = require('request');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var fs = require('fs');
var path = require('path');
chai.use(sinonChai);

describe('httpsRequest.js', function () {

  describe('create', function () {

    var crtFile = path.resolve(__dirname, '../acceptance/support/keys/ca.crt');
    var crtFile2 = path.resolve(__dirname, '../acceptance/support/keys/server.crt');
    var cert1 = fs.readFileSync(crtFile, { encoding: 'ascii' });
    var cert2 = fs.readFileSync(crtFile2, { encoding: 'ascii' });

    beforeEach(function () {
      sinon.stub(request, 'defaults');
    });

    afterEach(function () {
      request.defaults.restore();
    });

    it('should set strictSSL to false if strictSSL param = false', function () {
      httpsRequest.create('false');

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: false
      });
    });

    it('should set strictSSL to false if strictSSL param = FALSE', function () {
      httpsRequest.create('FALSE');

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: false
      });
    });

    it('should set strictSSL to true if strictSSL param != false', function () {
      httpsRequest.create('true');

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: true
      });
    });

    it('should set strictSSL to true if strictSSL param is blank', function () {
      httpsRequest.create('');

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: true
      });
    });

    it('should set strictSSL to true if strictSSL param is undefined', function () {
      httpsRequest.create();

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: true
      });
    });

    it('should only set strictSSL to true if all params are blank strings', function () {
      httpsRequest.create('', '', '');

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: true
      });
    });

    it('should set ca and agentOptions.ca if ca param is set', function () {
      httpsRequest.create('', '', cert1);

      expect(request.defaults).to.have.been.calledWith({
        ca: cert1,
        strictSSL: true,
        agentOptions: {
          ca: cert1
        }
      });

    });

    it('should not modify strictSSL if ca param is set', function () {

      httpsRequest.create('false', '', cert1);

      expect(request.defaults).to.have.been.calledWith({
        ca: cert1,
        strictSSL: false,
        agentOptions: {
          ca: cert1
        }
      });

    });

    it('should load the ca file and set ca and agentOptions.ca if caFile param is set', function () {

      httpsRequest.create('', crtFile);

      expect(request.defaults).to.have.been.calledWith({
        ca: cert1,
        strictSSL: true,
        agentOptions: {
          ca: cert1
        }
      });

    });


    it('should not modify strictSSL if caFile param is set', function () {

      httpsRequest.create('false', crtFile);

      expect(request.defaults).to.have.been.calledWith({
        ca: cert1,
        strictSSL: false,
        agentOptions: {
          ca: cert1
        }
      });

    });

    it('should give ca param precedence over caFile param', function () {

      httpsRequest.create('', crtFile, cert2);

      expect(request.defaults).to.have.been.calledWith({
        ca: cert2,
        strictSSL: true,
        agentOptions: {
          ca: cert2
        }
      });

    });

  });

});
