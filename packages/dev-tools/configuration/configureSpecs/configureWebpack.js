const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HappyPack = require('happypack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const {SpecWrapperPlugin} = require('../../plugins/SpecWrapperPlugin')

function selectEnv(env) {
  return ['development', 'production', 'test'].includes(env) ? env : 'production'
}

module.exports = function(specConfig) {
  const pkgPath = process.cwd()

  const pkgSrc = path.join(pkgPath, 'src')
  const appEnv = selectEnv(specConfig.env)

  const specPlugins = [
    new SpecWrapperPlugin(pkgSrc),

    new webpack.ProvidePlugin({
      Testbed: require.resolve('../../specs/ReactTestbed')
    })
  ]

  const webpackConfig = {
    devtool: 'source-map',

    entry: null,

    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.js$/,
          use: 'happypack/loader?id=babel'
        },
        {
          exclude: /node_modules/,
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'url-loader?limit=10000&name=img/[hash:12]/[ext]'
            }
          ]
        },
        {
          exclude: '/node_modules/',
          loaders: ['style-loader', 'css-loader?localIdentName=[path][name]---[local]'],
          test: /\.(css)$/
        }
      ]
    },

    output: {
      filename: 'js/[name].js',
      path: path.join(pkgPath, '__spec_build__'),
      publicPath: '/'
    },

    plugins: [
      new webpack.DefinePlugin({
        DEVELOPMENT: JSON.stringify(appEnv === 'development'),
        PRODUCTION: JSON.stringify(appEnv === 'production'),
        TEST: JSON.stringify(appEnv === 'test')
      }),

      new HappyPack({
        id: 'babel',
        loaders: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  'module:@jneander/babel-presets',
                  {
                    modules: false,
                    themeable: !!specConfig.themeable
                  }
                ]
              ]
            }
          }
        ],
        threads: 1
      }),

      ...specPlugins
    ],

    resolve: {
      alias: {
        React: 'react'
      },
      modules: [pkgSrc, 'node_modules']
    },

    stats: {
      colors: true
    }
  }

  webpackConfig.plugins.unshift(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(appEnv)
      }
    })
  )

  return webpackConfig
}
