const configureWebpack = require('@jneander/dev-tools/lib/configuration/configureWebpack')
const {getEnv} = require('@jneander/dev-tools/lib/cli')

module.exports = configureWebpack({
  env: getEnv(),
  pages: [
    {
      name: 'home',
      outputPath: '',
      sourcePath: 'bundles/home.js',
      template: 'markup/index.html'
    },
    {
      name: 'data-grid',
      outputPath: 'data-grid',
      sourcePath: 'bundles/data-grid.js',
      template: 'markup/index.html'
    },
    {
      name: 'static-grid',
      outputPath: 'static-grid',
      sourcePath: 'bundles/static-grid.js',
      template: 'markup/index.html'
    },
    {
      name: 'wai-data-grid',
      outputPath: 'wai-data-grid',
      sourcePath: 'bundles/wai-data-grid.js',
      template: 'markup/index.html'
    }
  ]
})
