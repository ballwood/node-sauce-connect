var chai = require('chai');
var expect = chai.expect;
var package = require('../package.json');
var manifest = require('../manifest.json');

describe('package.json', function () {

  it('version field should start with the manifest package version', function () {
    expect(package.version.indexOf(manifest.version)).to.equal(0);
  });

});
