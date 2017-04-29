var fs = require('fs');
var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');

var bundlePath = path.join(__dirname, '..', 'lib/bundles');

var entries = {
  home: [
    'babel-polyfill',
    path.join(bundlePath, 'home.js')
  ]
};
var plugins = [
  new HtmlWebpackPlugin({
    chunks: ['home'],
    filename: 'index.html',
    template: path.join(__dirname, '..', 'lib/markup/index.html')
  })
];

fs.readdirSync(bundlePath).forEach(function (filename) {
  if (filename === 'home.js') {
    return;
  }

  var basename = path.basename(filename, '.js');

  entries[basename] = [
    'babel-polyfill',
    path.join(bundlePath, filename)
  ];

  plugins.push(
    new HtmlWebpackPlugin({
      chunks: [basename],
      filename: basename + '/index.html',
      template: path.join(__dirname, '..', 'lib/markup/index.html')
    })
  );
});

module.exports = {
  entries: entries,
  plugins: plugins
};
