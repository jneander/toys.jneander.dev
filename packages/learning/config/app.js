const configureApp = require('@jneander/dev-tools/configuration/configureApp')
const {getEnv} = require('@jneander/dev-tools/utils/cli')

module.exports = configureApp({
  env: getEnv(),
  pages: [
    {
      context: 'data-grids',
      outputPath: 'data-grids',
      pages: [
        {
          name: 'aria-data-tables',
          outputPath: 'aria-data-tables',
          sourcePath: 'aria-data-tables'
        },
        {
          name: 'aria-layout-grids',
          outputPath: 'aria-layout-grids',
          sourcePath: 'aria-layout-grids'
        },
        {
          name: 'data-grid-v0',
          outputPath: 'data-grid-v0',
          sourcePath: 'data-grid-v0'
        },
        {
          name: 'data-grid-v1',
          outputPath: 'data-grid-v1',
          sourcePath: 'data-grid-v1'
        },
        {
          name: 'data-grid-v2',
          outputPath: 'data-grid-v2',
          sourcePath: 'data-grid-v2'
        },
        {
          name: 'data-grid-v3',
          outputPath: 'data-grid-v3',
          sourcePath: 'data-grid-v3'
        },
        {
          name: 'data-grid-v4',
          outputPath: 'data-grid-v4',
          sourcePath: 'data-grid-v4'
        },
        {
          name: 'frozen-grid-v1',
          outputPath: 'frozen-grid-v1',
          sourcePath: 'frozen-grid-v1'
        },
        {
          name: 'nine-patch-v2',
          outputPath: 'nine-patch-v2',
          sourcePath: 'nine-patch-v2'
        },
        {
          name: 'static-grid',
          outputPath: 'static-grid',
          sourcePath: 'static-grid'
        },
        {
          name: 'static-table',
          outputPath: 'static-table',
          sourcePath: 'static-table'
        }
      ],
      sourcePath: 'data-grids',
      template: 'shared/markup/index.html'
    },
    {
      name: 'genetic-algorithms',
      outputPath: 'genetic-algorithms',
      sourcePath: 'genetic-algorithms',
      template: 'shared/markup/index.html'
    },
    {
      name: 'home',
      outputPath: '',
      sourcePath: 'home',
      template: 'shared/markup/index.html'
    }
  ]
})
