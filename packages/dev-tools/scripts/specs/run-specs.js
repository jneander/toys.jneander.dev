#!/usr/bin/env node

const path = require('path')

const {getEnv, getString} = require('../../lib/cli')
const {getCommand, runCommands} = require('../../lib/utils')

const env = `NODE_ENV=${getEnv('test')}`
const args = ['start']

if (process.argv.includes('--watch')) {
  args.push('--no-single-run')
} else {
  args.push('--single-run', '--no-auto-watch')
}

const configPath = path.join(process.cwd(), getString('config'))
args.push(configPath)

const result = runCommands({
  'run-specs': getCommand([env], 'karma', args)
})

process.exit(result.status)
