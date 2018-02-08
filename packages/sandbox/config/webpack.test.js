var webpack = require('webpack');

var config = require('../config/webpack.js');

config.entry = null;

config.module.rules.push({
  exclude: '/node_modules/',
  loaders: ['style-loader', 'css-loader?localIdentName=[path][name]---[local]'],
  test: /\.(css)$/
});

config.plugins.unshift(new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify('test')
  }
}));

module.exports = config;
