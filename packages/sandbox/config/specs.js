const configure = require('@jneander/dev-tools/configs/karma')

module.exports = configure({
  appConfig: require('./app.js'),
  filePatterns: ['spec/*Spec.js', 'spec/**/*Spec.js'],
  globals: 'spec/globals.js'
})
