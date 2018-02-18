const configureWebpack = require('@jneander/dev-tools/configuration/configureWebpack')
const {getEnv} = require('@jneander/dev-tools/lib/cli')

module.exports = configureWebpack({
  env: getEnv(),
  pages: [
    {
      name: 'data-grid',
      outputPath: 'data-grids/data-grid',
      sourcePath: 'js/data-grids/data-grid',
      template: 'markup/index.html'
    },
    {
      name: 'home',
      outputPath: '',
      sourcePath: 'js/home',
      template: 'markup/index.html'
    },
    {
      name: 'genetic-algorithms',
      outputPath: 'genetic-algorithms',
      sourcePath: 'js/genetic-algorithms',
      template: 'markup/index.html'
    },
    {
      name: 'static-grid',
      outputPath: 'data-grids/static-grid',
      sourcePath: 'js/data-grids/static-grid',
      template: 'markup/index.html'
    },
    {
      name: 'wai-data-grid',
      outputPath: 'data-grids/wai-data-grid',
      sourcePath: 'js/data-grids/wai-data-grid',
      template: 'markup/index.html'
    }
  ]
})
