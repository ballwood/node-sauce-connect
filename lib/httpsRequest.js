var fs = require('fs');
var request = require('request');
var progress = require('request-progress');

function create(strictSSL, caFile, caString) {

  var options = {};
  var ca;

  options.strictSSL = !!strictSSL;

  if (!caString && caFile) {

    if (!fs.existsSync(caFile)) {
      throw new Error('CA File ' + caFile + ' not found');
    }

    ca = fs.readFileSync(caFile, { encoding: 'utf8' });

  } else {
    ca = caString;
  }

  if (ca) {
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
