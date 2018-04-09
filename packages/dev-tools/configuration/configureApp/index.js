const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HappyPack = require('happypack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const {Page, PageWrapperPlugin} = require('../../plugins/PageWrapperPlugin')

function selectEnv(env) {
  return ['development', 'production'].includes(env) ? env : 'production'
}

module.exports = function(appConfig) {
  const pkgPath = process.cwd()

  const pkgSrc = path.join(pkgPath, 'src')
  const appEnv = selectEnv(appConfig.env)
  const pages = appConfig.pages || []

  const pageEntries = {}
  const pagePlugins = []

  function configurePage(config) {
    if (config.context) {
      const contextPages = config.pages || []
      contextPages.forEach(contextConfig => {
        configurePage({
          name: contextConfig.name,
          outputPath: path.join(config.outputPath, contextConfig.outputPath),
          sourcePath: path.join(config.sourcePath, contextConfig.sourcePath),
          template: config.template || contextConfig.template,
          type: contextConfig.type || config.type
        })
      })
    } else if (config.type === 'static') {
      const page = new Page(config)

      pagePlugins.push(
        new HtmlWebpackPlugin({
          chunks: [],
          filename: `${page.outputPath ? page.outputPath + '/' : ''}index.html`,
          template: path.join(pkgSrc, page.template)
        })
      )
    } else {
      const page = new Page(config)

      pageEntries[page.chunkName] = ['@babel/polyfill', path.join(pkgPath, page.bundlePath)]

      pagePlugins.push(new PageWrapperPlugin(page))

      pagePlugins.push(
        new HtmlWebpackPlugin({
          chunks: ['vendor', page.chunkName],
          filename: `${page.outputPath ? page.outputPath + '/' : ''}index.html`,
          template: path.join(pkgSrc, page.template)
        })
      )
    }
  }

  pages.forEach(configurePage)

  const webpackConfig = {
    devtool: 'source-map',

    entry: pageEntries,

    externals: appConfig.globalImports,

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
                    themeable: !!appConfig.themeable
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
  }

  return webpackConfig
}
