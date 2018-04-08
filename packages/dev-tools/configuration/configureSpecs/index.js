const path = require('path')

const VirtualModuleWebpackPlugin = require('virtual-module-webpack-plugin')

const {getEnv} = require('../../utils/cli')
const configureWebpack = require('./configureWebpack')

module.exports = function configure(options) {
  const pkgPath = process.cwd()

  const files = options.filePatterns.map(pattern => ({
    pattern,
    watched: false
  }))

  const preprocessors = options.filePatterns.reduce((map, pattern) => {
    map[pattern] = ['webpack', 'sourcemap']
    return map
  }, {})

  if (options.globals) {
    files.push(options.globals)
    preprocessors[options.globals] = ['webpack', 'sourcemap']
  }

  return function(config) {
    config.set({
      browsers: ['Chrome'],
      frameworks: ['mocha'],

      colors: true,
      reporters: ['progress'],

      logLevel: config.LOG_INFO,

      port: 9876,

      basePath: pkgPath,
      files,
      preprocessors,

      webpackServer: {
        noInfo: true
      },

      webpack: configureWebpack({
        env: options.env || getEnv(),
        srcPath: path.join(pkgPath, options.srcPath),
        themeable: options.themeable
      })
    })
  }
}
