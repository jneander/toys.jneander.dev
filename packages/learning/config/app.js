const configure = require('@jneander/dev-tools/configs/webpack')
const {getEnv} = require('@jneander/dev-tools/lib/cli')

module.exports = configure({
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
    }
  ]
})
