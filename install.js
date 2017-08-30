var installer = require('./lib/installer');

var cdnUrl = process.env.npm_config_sauceconnect_cdnurl ||
             process.env.sauceconnect_cdnurl ||
             process.env.SAUCECONNECT_CDNURL;

var debugMode = process.env.npm_config_node_sauce_connect_debug ||
                process.env.node_sauce_connect_debug ||
                process.env.NODE_SAUCE_CONNECT_DEBUG;

var logger = console.log;

installer.install(
  logger,
  cdnUrl,
  process.platform,
  process.arch,
  debugMode
).then(function () {
  process.exit(0);
}).catch(function (err) {
  console.log(err);
  process.exit(1);
});

