const VirtualModuleWebpackPlugin = require('virtual-module-webpack-plugin')

const bundleReactPage = require('../building/bundleReactPage')

class Page {
  constructor(options) {
    this.options = options
  }

  get bundlePath() {
    return `src/__bundles__/${this.name}.js`
  }

  get chunkName() {
    return this.name
  }

  get name() {
    return this.options.name
  }

  get outputPath() {
    return this.options.outputPath
  }

  get sourcePath() {
    return this.options.sourcePath
  }

  get template() {
    return this.options.template
  }
}

class PageWrapperPlugin {
  constructor(page) {
    this.virtualModulePlugin = new VirtualModuleWebpackPlugin({
      contents: bundleReactPage(page),
      moduleName: page.bundlePath
    })
  }

  apply(compiler) {
    this.virtualModulePlugin.apply(compiler)
  }
}

module.exports = {Page, PageWrapperPlugin}
