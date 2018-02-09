module.exports = function(context, opts = {}) {
  const presets = [
    ["@babel/preset-es2015", {modules: opts.type === 'lib' ? 'commonjs' : false}],
    "@babel/preset-stage-1",
    "@babel/preset-react"
  ]

  const plugins = [
    ['@jneander/babel-plugin-themeable-styles', {ignore: /node_modules/}],
    require('@instructure/babel-plugin-transform-class-display-name')
  ]

  return {
    presets,
    plugins
  }
}
