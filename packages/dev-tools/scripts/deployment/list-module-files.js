#!/usr/bin/env node

const path = require('path')

const npmPacklist = require('npm-packlist')

const {getString} = require('../../utils/cli')

const packagePath = path.join(process.cwd(), 'packages', getString('pkg'))

npmPacklist({path: packagePath})
  .then(files => {
    files.sort().forEach(file => {
      console.log(`* ${file}`)
    })
  })
  .catch(error => {
    console.error(error)
  })
