const configureWebpack = require('@jneander/dev-tools/configuration/configureWebpack')
const {getEnv} = require('@jneander/dev-tools/utils/cli')

module.exports = configureWebpack({
  env: getEnv(),
  pages: [
    {
      context: 'data-grids',
      outputPath: 'data-grids',
      pages: [
        {
          name: 'data-grid',
          outputPath: 'data-grid',
          sourcePath: 'data-grid'
        },
        {
          name: 'static-grid',
          outputPath: 'static-grid',
          sourcePath: 'static-grid'
        },
        {
          name: 'wai-data-grid',
          outputPath: 'wai-data-grid',
          sourcePath: 'wai-data-grid'
        }
      ],
      sourcePath: 'js/data-grids',
      template: 'markup/index.html'
    },
    {
      name: 'genetic-algorithms',
      outputPath: 'genetic-algorithms',
      sourcePath: 'js/genetic-algorithms',
      template: 'markup/index.html'
    },
    {
      name: 'home',
      outputPath: '',
      sourcePath: 'js/home',
      template: 'markup/index.html'
    }
  ]
})
