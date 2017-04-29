var webpack = require('webpack');

var config = require('../config/webpack.js');

config.module.rules.push({
  test: /\.(css)$/,
  use: ['style-loader', 'css-loader?localIdentName=[path][name]---[local]']
});

config.plugins.unshift(new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify('development')
  }
}));

// prints more readable module names in the browser console on HMR updates
config.plugins.push(new webpack.NamedModulesPlugin());

module.exports = config;
