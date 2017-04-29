var path = require('path');

var WebpackDevServer = require('webpack-dev-server');
var WriteFilePlugin = require('write-file-webpack-plugin');
var rimraf = require('rimraf');
var webpack = require('webpack');

var bundles = require('../config/bundles');
var config = require('../config/webpack.development.js');

var port = process.env.PORT || 8080;

config.bail = false;

Object.keys(bundles.entries).forEach(function (bundleName) {
  config.entry[bundleName].unshift('react-hot-loader/patch');
  config.entry[bundleName].push('webpack/hot/dev-server');
  config.entry[bundleName].push('webpack-dev-server/client?http://localhost:' + port + '/');
});

config.plugins.unshift(new webpack.HotModuleReplacementPlugin());
config.plugins.push(new webpack.NoErrorsPlugin());

if (process.env.WRITE_TO_DIST) {
  config.plugins.push(new WriteFilePlugin());
}

rimraf.sync(config.output.path);
var compiler = webpack(config);

compiler.run(function (err, stats) {
  if (!err) {
    var server = new WebpackDevServer(compiler, {
      contentBase: config.output.path,
      filename: config.output.filename,
      hot: true,
      publicPath: config.output.publicPath,
      stats: {
        colors: true
      }
    });
    server.listen(port, 'localhost', function () {});
  }
});
