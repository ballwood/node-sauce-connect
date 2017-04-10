var installer = require('./lib/installer');

var cdnUrl = process.env.npm_config_sauceconnect_cdnurl || process.env.SAUCECONNECT_CDNURL;

installer.install(cdnUrl, process.platform, process.arch).then(function () {
  process.exit(0);
}).catch(function (err) {
  console.log(err);
  process.exit(1);
});

