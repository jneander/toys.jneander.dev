const configureSpecs = require('@jneander/dev-tools/configuration/configureSpecs')

module.exports = configureSpecs({
  filePatterns: ['src/**/__specs__/**/*.spec.js'],
  globals: 'config/specGlobals.js',
  srcPath: 'src'
})
