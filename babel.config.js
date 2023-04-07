const browserslist = require('./config/browserslist.config.cjs')

module.exports = {
  presets: [
    [
      '@babel/preset-env',

      {
        modules: false,

        targets: {
          browsers: browserslist
        }
      }
    ],

    ['@babel/preset-typescript'],

    [
      '@babel/preset-react',

      {
        runtime: 'automatic'
      }
    ]
  ],

  plugins: []
}
