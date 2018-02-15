module.exports = function(context, opts = {}) {
  const modules = opts.modules || false

  const presets = [
    ['@babel/preset-env', {
      modules,
      targets: {
        browsers: [
          'last 2 chrome versions',
          'last 2 firefox versions',
          'last 2 edge versions',
          'last 2 ios versions',
          'last 2 opera versions',
          'last 2 safari versions',
          'last 2 ChromeAndroid versions',
          'ie >= 11'
        ]
      },
      useBuiltIns: 'usage'
    }],
    '@babel/preset-stage-3',
    '@babel/preset-react'
  ]

  const plugins = [
    require('@instructure/babel-plugin-transform-class-display-name')
  ]

  if (opts.themeable) {
    plugins.push(
      ['@jneander/babel-plugin-themeable-styles', {ignore: /node_modules/}]
    )
  }

  return {
    presets,
    plugins
  }
}
