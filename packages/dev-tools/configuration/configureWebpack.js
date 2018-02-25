const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HappyPack = require('happypack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const {Page, PageWrapperPlugin} = require('../plugins/PageWrapperPlugin')

function selectEnv(env) {
  return ['development', 'production', 'test'].includes(env) ? env : 'production'
}

module.exports = function(appConfig) {
  const pkgPath = process.cwd()

  const pkgSrc = path.join(pkgPath, 'src')
  const appEnv = selectEnv(appConfig.env)

  const pageEntries = {}
  const pagePlugins = []

  appConfig.pages.forEach(pageConfig => {
    const page = new Page(pageConfig)

    pageEntries[page.chunkName] = ['@babel/polyfill', path.join(pkgPath, page.bundlePath)]

    pagePlugins.push(new PageWrapperPlugin(page))

    pagePlugins.push(
      new HtmlWebpackPlugin({
        chunks: ['vendor', page.chunkName],
        filename: `${page.outputPath ? page.outputPath + '/' : ''}index.html`,
        template: path.join(pkgSrc, page.template)
      })
    )
  })

  const webpackConfig = {
    devtool: 'source-map',

    entry: pageEntries,

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
        }
      ]
    },

    output: {
      filename: 'js/[name].js',
      path: path.join(pkgPath, '__build__'),
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
                    themeable: false
                  }
                ]
              ]
            }
          }
        ],
        threads: 4
      }),

      ...pagePlugins
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

  if (appEnv === 'development') {
    webpackConfig.module.rules.push({
      test: /\.(css)$/,
      use: ['style-loader', 'css-loader?localIdentName=[path][name]---[local]']
    })

    webpackConfig.plugins.push(new webpack.NamedModulesPlugin())
    webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        minChunk: function(module) {
          return /node_modules/.test(module.resource)
        },
        name: 'vendor'
      })
    )
  } else if (appEnv === 'production') {
    webpackConfig.bail = true

    webpackConfig.module.rules.push({
      test: /\.(css)$/,
      use: ExtractTextPlugin.extract({
        use: 'css-loader?localIdentName=[hash:base64:10]'
      })
    })

    webpackConfig.output.filename = 'js/[name].[hash:12].min.js'

    webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        minChunk: function(module) {
          return /node_modules/.test(module.resource)
        },
        name: 'vendor'
      })
    )
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin())
    webpackConfig.plugins.push(new ExtractTextPlugin('styles/index-[contenthash:10].css'))
  } else if (appEnv === 'test') {
    webpackConfig.entry = null

    webpackConfig.module.rules.push({
      exclude: '/node_modules/',
      loaders: ['style-loader', 'css-loader?localIdentName=[path][name]---[local]'],
      test: /\.(css)$/
    })
  }

  return webpackConfig
}
