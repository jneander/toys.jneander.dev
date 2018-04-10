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
          name: 'data-grid',
          outputPath: 'data-grid',
          sourcePath: 'data-grid'
        },
        {
          name: 'static-table',
          outputPath: 'static-table',
          sourcePath: 'static-table'
        },
        {
          name: 'wai-data-grid',
          outputPath: 'wai-data-grid',
          sourcePath: 'wai-data-grid'
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
    },
    {
      context: 'html-grids',
      outputPath: 'html-grids',
      pages: [
        {
          name: 'static-table',
          outputPath: 'static-table',
          sourcePath: 'static-table',
          template: 'html-grids/static-table/index.html'
        },
        {
          name: 'static-table-with-row-headers',
          outputPath: 'static-table-with-row-headers',
          sourcePath: 'static-table-with-row-headers',
          template: 'html-grids/static-table-with-row-headers/index.html'
        },
        {
          name: 'aria-static-grid',
          outputPath: 'aria-static-grid',
          sourcePath: 'aria-static-grid',
          template: 'html-grids/aria-static-grid/index.html'
        },
        {
          name: 'aria-static-grid-with-row-headers',
          outputPath: 'aria-static-grid-with-row-headers',
          sourcePath: 'aria-static-grid-with-row-headers',
          template: 'html-grids/aria-static-grid-with-row-headers/index.html'
        }
      ],
      sourcePath: 'html-grids',
      type: 'static'
    }
  ]
})
