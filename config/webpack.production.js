const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssPresetEnv = require('postcss-preset-env')

const config = require('./webpack.shared')()

config.mode = 'production'
config.bail = true

config.module.rules.push({
  sideEffects: true,
  test: /\.css$/,

  use: [
    {loader: MiniCssExtractPlugin.loader},

    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[hash:base64:10]',
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

config.optimization.chunkIds = 'deterministic'
config.optimization.moduleIds = 'deterministic'
config.output.filename = 'js/[id].[contenthash].min.js'

config.plugins.push(
  new MiniCssExtractPlugin({
    filename: 'styles/[name].css',
    chunkFilename: 'styles/index-[contenthash:10].css',
  }),

  new CleanWebpackPlugin({
    cleanAfterEveryBuildPatterns: ['*.LICENSE.txt'],
    protectWebpackAssets: false,
  }),
)

module.exports = config
