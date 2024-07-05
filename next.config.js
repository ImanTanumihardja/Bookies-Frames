const path = require('path');

module.exports = {
    webpack: (config) => {
        config.resolve.alias['@abis'] = path.join(__dirname, 'abis');
        return config;
      },
}