#!/usr/bin/env node

const path = require('path')

const {getStringArray} = require('../../lib/cli')
const {getCommand, runCommands} = require('../../lib/utils')

const args = ['--write', '--no-bracket-spacing', '--no-semi', '--print-width 120', '--single-quote']

const paths = getStringArray('include')
paths.push('config', 'scripts', 'spec', 'src')

args.push(`'./{${paths.join(',')}}/**/*.js'`)

const result = runCommands({
  'format:js': getCommand([], 'prettier', args)
})

process.exit(result.status)
