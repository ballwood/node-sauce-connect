var fs = require('fs');
var request = require('request');

module.exports = function (strictSSL, caFile, caString) {

  var options = {};
  var ca;

  var normalized = strictSSL.toLowerCase();

  options.strictSSL = !(normalized && normalized === 'false');

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

};

