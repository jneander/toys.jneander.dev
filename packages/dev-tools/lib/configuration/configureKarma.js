module.exports = function configure(options) {
  const pkgPath = process.cwd()

  const files = options.filePatterns.map(pattern => ({
    pattern, watched: false}
  ))

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

      webpack: options.appConfig
    })
  }
}
