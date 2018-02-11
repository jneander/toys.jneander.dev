function getEntry(name) {
  const index = process.argv.findIndex(entry => entry.startsWith(`--${name}`))
  if (index > 0) {
    return process.argv.slice(index, index + 2)
  }
  return []
}

function getEnv(defaultValue = 'production') {
  return ['development', 'production', 'test'].includes(process.env.NODE_ENV)
    ? process.env.NODE_ENV
    : defaultValue
}

function getFlag(name) {
  return process.argv.includes(`--${name}`)
}

function getInteger(name) {
  const entries = getEntry(name)
  return parseInt(entries[1], 10)
}

function getString(name) {
  const entries = getEntry(name)
  return entries[1] || null
}

function getVar(name) {
  const variable = process.argv.find(v => v.startsWith(`${name}=`))
  if (variable) {
    return variable.split('=')[1]
  }
  return null
}

function getVarFlag(name) {
  return process.argv.find(v => v.startsWith(`${name}=`))
}

function getVarInteger(name) {
  return parseInt(getVar(name), 10)
}

module.exports = {
  getEnv,
  getFlag,
  getInteger,
  getString,
  getVar,
  getVarFlag,
  getVarInteger
}
