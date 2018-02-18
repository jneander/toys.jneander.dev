#!/usr/bin/env node

const path = require('path')

const {getFlag, getStringArray} = require('../../utils/cli')
const {getCommand, runCommands} = require('../utils')

let suffix = ''
const args = ['--no-bracket-spacing', '--no-semi', '--print-width 100', '--single-quote']

if (process.argv.includes('--fix')) {
  args.unshift('--write')
  suffix = ':fix'
} else {
  args.unshift('-l')
}

if (getFlag('all')) {
  args.push(`'./**/*.js'`)
} else {
  const paths = getStringArray('include')
  paths.push('config', 'scripts', 'spec', 'src')
  args.push(`'./{${paths.join(',')}}/**/*.js'`)
}

const result = runCommands({
  [`lint:js${suffix}`]: getCommand([], 'prettier', args)
})

process.exit(result.status)
