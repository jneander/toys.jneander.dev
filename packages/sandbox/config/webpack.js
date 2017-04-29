var path = require('path');

var webpack = require('webpack');

var bundles = require('../config/bundles');

var PRODUCTION = process.env.NODE_ENV === 'production';
var DEVELOPMENT = !PRODUCTION;

module.exports = {
  devtool: 'source-map',

  entry: Object.assign(
    {},
    bundles.entries,
    { react: ['react', 'react-dom'] }
  ),

  module: {
    rules: [{
      exclude: path.join(__dirname, '..', 'node_modules'),
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: ['react-hot-loader/babel'],
          presets: [
            ['es2015', { modules: false }],
            'babel-preset-stage-1',
            'react'
          ]
        }
      }
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
    path: path.join(__dirname, '..', 'dist'),
    publicPath: '/'
  },

  plugins: [
    new webpack.DefinePlugin({
      DEVELOPMENT: JSON.stringify(DEVELOPMENT),
      PRODUCTION: JSON.stringify(PRODUCTION)
    })
  ].concat(bundles.plugins),

  resolve: {
    alias: {
      react: path.resolve(__dirname, '../node_modules/react'),
      React: path.resolve(__dirname, '../node_modules/react')
    },

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
