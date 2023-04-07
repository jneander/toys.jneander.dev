const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')

const config = require('./webpack.shared')()

config.mode = 'development'

config.module.rules.push({
  sideEffects: true,
  test: /\.css$/,

  use: [
    {loader: 'style-loader'},

    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[path][name]---[local]',
          mode: 'local',
        },
        sourceMap: true,
      },
    },

    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            postcssPresetEnv({
              browsers: require('./browserslist.config.cjs'),
              stage: 4,
            }),
          ],
        },

        sourceMap: true,
      },
    },
  ],
})

config.optimization.chunkIds = 'named'
config.optimization.moduleIds = 'named'
config.output.filename = 'js/[name].js'

config.plugins.unshift(new CleanWebpackPlugin())

module.exports = config
