const configureApp = require('@jneander/dev-tools/configuration/configureApp')
const {getEnv} = require('@jneander/dev-tools/utils/cli')

module.exports = configureApp({
  env: getEnv(),
  pages: [
    {
      name: 'home',
      outputPath: '',
      sourcePath: 'js/home',
      template: 'markup/index.html'
    }
  ]
})
