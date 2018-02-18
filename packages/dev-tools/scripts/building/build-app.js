#!/usr/bin/env node

const path = require('path')

const {getEnv, getVarFlag, getVarInteger, getString} = require('../../utils/cli')
const {getCommand, runCommands} = require('../utils')

const vars = []
vars.push(`NODE_ENV=${getEnv('production')}`)

const args = []
const configPath = path.join(process.cwd(), getString('config'))
args.push(`--config ${configPath}`)

let result

if (process.argv.includes('--serve')) {
  if (getVarInteger('PORT')) {
    vars.push(`PORT=${getVarInteger('PORT')}`)
  }

  if (getVarFlag('WRITE_TO_DIST')) {
    vars.push(`WRITE_TO_DIST=${getVarFlag('WRITE_TO_DIST')}`)
  }

  const scriptPath = path.join(__dirname, 'watch-app.js')

  result = runCommands({
    'build-app:serve': getCommand(vars, scriptPath, args)
  })
} else {
  if (process.argv.includes('--watch')) {
    args.push('--watch')
  }

  result = runCommands({
    'build-app': getCommand(vars, 'webpack', [...args, '--progress'])
  })
}

process.exit(result.status)
