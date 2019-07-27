const configureApp = require('@jneander/dev-tools/configuration/configureApp')
const {getEnv} = require('@jneander/dev-tools/utils/cli')

module.exports = configureApp({
  env: getEnv(),
  pages: [
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
