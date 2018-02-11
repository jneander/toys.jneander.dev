#!/usr/bin/env node

const path = require('path')

const WebpackDevServer = require('webpack-dev-server')
const WriteFilePlugin = require('write-file-webpack-plugin')
const rimraf = require('rimraf')
const webpack = require('webpack')

const {getVarFlag, getVarInteger, getString} = require('../../lib/cli')

const config = require(getString('config'))
const port = getVarInteger('PORT') || 8080

config.bail = false

Object.keys(config.entry).forEach(name => {
  config.entry[name].unshift('react-hot-loader/patch')
  config.entry[name].push('webpack/hot/dev-server')
  config.entry[name].push(`webpack-dev-server/client?http://localhost:${port}/`)
})

config.plugins.unshift(new webpack.HotModuleReplacementPlugin())
config.plugins.push(new webpack.NoErrorsPlugin())

if (getVarFlag('WRITE_TO_DIST')) {
  config.plugins.push(new WriteFilePlugin())
}

rimraf.sync(config.output.path)
const compiler = webpack(config)

compiler.run((err, stats) => {
  if (!err) {
    const server = new WebpackDevServer(compiler, {
      contentBase: config.output.path,
      filename: config.output.filename,
      hot: true,
      publicPath: config.output.publicPath,
      stats: {
        colors: true
      }
    })
    server.listen(port, 'localhost', () => {})
  }
})
