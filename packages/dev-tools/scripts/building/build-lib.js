#!/usr/bin/env node

const path = require('path')

const {getCommand, runCommands} = require('../../lib/utils')

const env = `NODE_ENV=${process.env.NODE_ENV || 'production'}`
const sourcePath = path.join(process.cwd(), 'src')
const args = [sourcePath, '--ignore *.spec.js']

if (process.argv.includes('--watch')) {
  args.push('--watch')
}

function buildArgs(args, type) {
  return [
    ...args,
    `--config-file ${path.join(__dirname, `babelrc.${type}.js`)}`,
    `--out-dir ${path.join(process.cwd(), type)}`
  ]
}

const result = runCommands({
  'build-lib:es': getCommand([env], 'babel', buildArgs(args, 'es')),
  'build-lib:lib': getCommand([env], 'babel', buildArgs(args, 'lib'))
})

process.exit(result.status)
