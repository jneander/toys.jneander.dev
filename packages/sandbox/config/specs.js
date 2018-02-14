const configureKarma = require('@jneander/dev-tools/lib/configuration/configureKarma')

module.exports = configureKarma({
  appConfig: require('./app.js'),
  filePatterns: ['spec/*Spec.js', 'spec/**/*Spec.js'],
  globals: 'spec/globals.js'
})
