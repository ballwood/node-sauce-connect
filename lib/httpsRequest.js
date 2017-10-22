var fs = require('fs');
var request = require('request');
var progress = require('request-progress');

function create(strictSSL, caFile, caString) {

  var options = {};
  var ca = caString;

  options.strictSSL = !!strictSSL;

  if (!ca && caFile) {

    if (!fs.existsSync(caFile)) {
      throw new Error('CA File ' + caFile + ' not found');
    }

    ca = fs.readFileSync(caFile, { encoding: 'utf8' });

  } else if (ca) {

    if (ca.match(/^"[\s\S]*"$/)) {
      try {
        ca = JSON.parse(ca.trim());
      } catch (e) {
        throw new Error('Failed parsing ca string');
      }
    }

  }

  if (ca) {

    ca = ca.match(/(-----BEGIN CERTIFICATE-----[\S\s]*?-----END CERTIFICATE-----)/g);

    options.agentOptions = {
      ca: ca
    };

    options.ca = ca;
  }

  return request.defaults(options);

}

function wrapWithProgress(requestObj) {
  return function (uri) {
    return progress(requestObj(uri));
  };
}

module.exports = {
  create: create,
  wrapWithProgress: wrapWithProgress
};
