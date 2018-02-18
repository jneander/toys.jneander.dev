const configureWebpack = require('@jneander/dev-tools/configuration/configureWebpack')
const {getEnv} = require('@jneander/dev-tools/utils/cli')

module.exports = configureWebpack({
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
