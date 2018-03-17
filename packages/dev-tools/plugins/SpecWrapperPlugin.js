const VirtualModuleWebpackPlugin = require('virtual-module-webpack-plugin')

const SPEC_BUNDLE_PATH = 'src/__bundles__/specs.js'

class SpecWrapperPlugin {
  constructor(srcPath) {
    this.virtualModulePlugin = new VirtualModuleWebpackPlugin({
      contents: `
  const context = require.context('${srcPath}', true, /\.spec\.js$/)
  context.keys().forEach(key => console.log(key))
  context.keys().forEach(context)
  module.exports = context
      `,
      moduleName: SPEC_BUNDLE_PATH
    })
  }

  apply(compiler) {
    this.virtualModulePlugin.apply(compiler)
  }
}

module.exports = {SpecWrapperPlugin}
