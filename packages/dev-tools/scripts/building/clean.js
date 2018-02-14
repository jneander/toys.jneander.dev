#!/usr/bin/env node

const {runCommands, getCommand} = require('../../lib/utils')

const paths = ['__build__', 'es', 'dist', 'lib', '.babel-cache']

const result = runCommands({
  clean: getCommand([], 'rimraf', paths)
})

process.exit(result.status)
