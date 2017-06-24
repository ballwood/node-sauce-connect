var http = require('http');
var https = require('https');

var server = http.createServer(function handler(req, res) {
  https.get('https://saucelabs.com' + req.url, function (ures) {
    ures.pipe(res);
    ures.on('end', function () {
      server.close();
    });
  });
});

server.listen(8080);
