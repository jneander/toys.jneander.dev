const {readFile} = require('node:fs/promises')
const {join} = require('node:path')

const {EleventyRenderPlugin} = require('@11ty/eleventy')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const webc = require('@11ty/eleventy-plugin-webc')
const autoprefixer = require('autoprefixer')
const eleventySass = require('eleventy-sass')
const postcss = require('postcss')

module.exports = function (config) {
  config.addPlugin(EleventyRenderPlugin, {
    tagName: 'renderTemplate',
    tagNameFile: 'renderFile',
  })

  config.addPlugin(eleventySass, {
    postcss: postcss([autoprefixer]),
  })

  config.addPlugin(webc, {
    components: join(__dirname, '..', 'eleventy/_components/**/*.webc'),
  })

  config.addPlugin(syntaxHighlight)

  config.setUseGitIgnore(false)

  config.addWatchTarget('./dist/webpack/**/*.*')

  config.addPassthroughCopy({'./dist/webpack/js': '/js'})
  config.addPassthroughCopy({'./dist/webpack/styles': '/styles'})
  config.addPassthroughCopy({'./public/*.*': '/'})
  config.addPassthroughCopy({'./public/fonts': '/fonts'})
  config.addPassthroughCopy({'./public/images': '/images'})

  config.addAsyncShortcode('assets', async function () {
    let manifest = {entrypoints: {}}

    try {
      const file = await readFile('./dist/webpack/assets.json')
      manifest = JSON.parse(file)
    } catch (e) {
      // noop
    }

    const {entrypoint} = this.ctx
    const assets = manifest.entrypoints[entrypoint]?.assets ?? {}

    const {js = [], css = []} = assets

    const scripts = js.map(path => `<script src="/${path}" defer></script>`)
    const links = css.map(path => `<link href="/${path}" rel="stylesheet">`)

    return scripts.concat(links).join('')
  })

  return {
    dir: {
      input: 'eleventy',
      layouts: '_layouts',
      output: 'dist/final',
    },
  }
}
