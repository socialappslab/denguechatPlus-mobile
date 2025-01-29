const withRollbarAndroid = require("./withRollbarAndroid");

const withRollbar = (config, options) => {
  if (!config.ios) {
    config = withRollbarAndroid(config, options);
  }

  return config;
};

module.exports = withRollbar;
