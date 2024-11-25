const withRollbarAndroid = require("./withRollbarAndroid");

const withRollbar = (config, options) => {
  config = withRollbarAndroid(config, options);

  return config;
};

module.exports = withRollbar;
