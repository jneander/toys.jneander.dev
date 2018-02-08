var path = require('path');

var HappyPack = require('happypack');
var webpack = require('webpack');

var bundles = require('../config/bundles');

var PRODUCTION = process.env.NODE_ENV === 'production';
var DEVELOPMENT = !PRODUCTION;

var happyPlugins = [];

module.exports = {
  devtool: 'source-map',

  entry: Object.assign(
    {},
    bundles.entries,
    { react: ['react', 'react-dom'] }
  ),

  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.js$/,
      use: 'happypack/loader?id=babel'
    }, {
      exclude: /node_modules/,
      test: /\.(png|jpg|gif)$/,
      use: [{
        loader: 'url-loader?limit=10000&name=img/[hash:12]/[ext]'
      }]
    }]
  },

  output: {
    filename: 'js/[name].js',
    path: path.join(__dirname, '..', '__build__'),
    publicPath: '/'
  },

  plugins: [
    new webpack.DefinePlugin({
      DEVELOPMENT: JSON.stringify(DEVELOPMENT),
      PRODUCTION: JSON.stringify(PRODUCTION)
    }),

    new HappyPack({
      id: 'babel',
      loaders: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['es2015', { modules: false }],
            'babel-preset-stage-1',
            'react'
          ]
        }
      }],
      threads: 4
    })
  ]
  .concat(bundles.plugins),

  resolve: {
    modules: [
      path.join(__dirname, '..', 'lib'),
      'local-modules',
      'node_modules'
    ]
  },

  stats: {
    colors: true
  }
};
