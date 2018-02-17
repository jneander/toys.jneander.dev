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
      name: 'genetic-algorithms',
      outputPath: 'genetic-algorithms',
      sourcePath: 'bundles/genetic-algorithms.js',
      template: 'markup/index.html'
    },
    {
      name: 'static-grid',
      outputPath: 'data-grids/static-grid',
      sourcePath: 'bundles/data-grids/static-grid.js',
      template: 'markup/index.html'
    },
    {
      name: 'wai-data-grid',
      outputPath: 'data-grids/wai-data-grid',
      sourcePath: 'bundles/data-grids/wai-data-grid.js',
      template: 'markup/index.html'
    }
  ]
})
