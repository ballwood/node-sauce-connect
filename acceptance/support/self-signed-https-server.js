var https = require('https');
var fs = require('fs');
var path = require('path');

var server = https.createServer({
  key: fs.readFileSync(path.resolve(__dirname, 'keys/server.key'), 'ascii'),
  cert: fs.readFileSync(path.resolve(__dirname, 'keys/server.crt'), 'ascii')
}, function handler(req, res) {
  https.get('https://saucelabs.com' + req.url, function (ures) {
    ures.pipe(res);
    ures.on('end', function () {
      server.close();
    });
  });
});

server.listen(8081);
