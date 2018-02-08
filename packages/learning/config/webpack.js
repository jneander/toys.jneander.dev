var path = require('path');

var HappyPack = require('happypack');
var webpack = require('webpack');

var bundles = require('../config/bundles');

var PRODUCTION = process.env.NODE_ENV === 'production';
var DEVELOPMENT = !PRODUCTION;

var conditionalPlugins = []

if (process.env.NODE_ENV !== 'test') {
  conditionalPlugins.push(new webpack.optimize.CommonsChunkPlugin({
    minChunk: function (module) {
      return /node_modules/.test(module.resource);
    },
    name: 'vendor'
  }))
}

module.exports = {
  devtool: 'source-map',

  entry: bundles.entries,

  module: {
    rules: [{
      exclude: path.join(__dirname, '..', 'node_modules'),
      test: /\.js$/,
      use: 'happypack/loader?id=babel'
    }, {
      exclude: '/node_modules/',
      test: /\.(png|jpg|gif)$/,
      use: {
        loader: 'url-loader?limit=10000&name=img/[hash:12]/[ext]'
      }
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
    }),

    ...conditionalPlugins
  ].concat(bundles.plugins),

  resolve: {
    modules: [
      path.join(__dirname, '..', 'src'),
      'local-modules',
      'node_modules'
    ]
  },

  stats: {
    colors: true
  }
};
