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
    var crtNotFound = path.resolve(__dirname, '../acceptance/support/keys/notfound.crt');
    var cert1 = fs.readFileSync(crtFile, { encoding: 'utf8' }).trim();
    var cert2 = fs.readFileSync(crtFile2, { encoding: 'utf8' }).trim();
    var cert1Newlines = cert1.replace(/\n/g, '\\n');
    var cert2Newlines = cert2.replace(/\n/g, '\\n');
    var cert1Env = '"' + cert1Newlines + '"';
    var cert2Env = '"' + cert2Newlines + '"';
    var cert1Cert2Env = '"' + cert1Newlines + '\\n' + cert2Newlines + '"';
    var cert1Parsed = JSON.parse(cert1Env).trim();
    var cert2Parsed = JSON.parse(cert2Env).trim();

    beforeEach(function () {
      sinon.stub(request, 'defaults');
      sinon.stub()
    });

    afterEach(function () {
      request.defaults.restore();
    });

    it('should set strictSSL to true if strictSSL param != \'\'', function () {
      httpsRequest.create('true');

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: true
      });
    });

    it('should set strictSSL to false if strictSSL param is blank', function () {
      httpsRequest.create('');

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: false
      });
    });

    it('should set strictSSL to false if strictSSL param is undefined', function () {
      httpsRequest.create();

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: false
      });
    });

    it('should only set strictSSL to false if all params are blank strings', function () {
      httpsRequest.create('', '', '');

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: false
      });
    });

    it('should set ca and agentOptions.ca if ca param is set', function () {
      httpsRequest.create('true', '', cert1Env);

      expect(request.defaults).to.have.been.calledWith({
        ca: [cert1Parsed],
        strictSSL: true,
        agentOptions: {
          ca: [cert1Parsed]
        }
      });

    });

    it('should parse string if contains double quotes', function () {

      httpsRequest.create('true', '', cert1Env);

      expect(request.defaults).to.have.been.calledWith({
        ca: [cert1Parsed],
        strictSSL: true,
        agentOptions: {
          ca: [cert1Parsed]
        }
      });

    });

    it('should not set the ca if the value is empty string', function () {

      httpsRequest.create('true', '', '""');

      expect(request.defaults).to.have.been.calledWith({
        strictSSL: true
      });

    });

    it('should throw an error if the ca string is not parseable', function () {
      expect(httpsRequest.create.bind(null, '', '', '"""')).to.throw(Error);
    });

    it('should not modify strictSSL if ca param is set', function () {

      httpsRequest.create('', '', cert1Env);

      expect(request.defaults).to.have.been.calledWith({
        ca: [cert1Parsed],
        strictSSL: false,
        agentOptions: {
          ca: [cert1Parsed]
        }
      });

    });

    it('should load the ca file and set ca and agentOptions.ca if caFile param is set', function () {

      httpsRequest.create('', crtFile);

      expect(request.defaults).to.have.been.calledWith({
        ca: [cert1.trim()],
        strictSSL: false,
        agentOptions: {
          ca: [cert1.trim()]
        }
      });

    });

    it('should throw an error if the caFile does not exist', function () {
      expect(httpsRequest.create.bind(null, '', crtNotFound)).to.throw(Error);
    });

    it('should not modify strictSSL if caFile param is set', function () {

      httpsRequest.create('true', crtFile);

      expect(request.defaults).to.have.been.calledWith({
        ca: [cert1Parsed],
        strictSSL: true,
        agentOptions: {
          ca: [cert1Parsed]
        }
      });

    });

    it('should give ca param precedence over caFile param', function () {

      httpsRequest.create('true', crtFile, cert2);

      expect(request.defaults).to.have.been.calledWith({
        ca: [cert2],
        strictSSL: true,
        agentOptions: {
          ca: [cert2]
        }
      });

    });

    it('should load up multiple certificates', function () {

      httpsRequest.create('true', '', cert1Cert2Env);

      expect(request.defaults).to.have.been.calledWith({
        ca: [cert1Parsed, cert2Parsed],
        strictSSL: true,
        agentOptions: {
          ca: [cert1Parsed, cert2Parsed]
        }
      });

    });

  });

  describe('wrapWithProgress', function () {

    it ('should wrap the function with progress')

  });

});
