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
      outputPath: 'data-grids/data-grid',
      sourcePath: 'bundles/data-grid.js',
      template: 'markup/index.html'
    }
  ]
})
