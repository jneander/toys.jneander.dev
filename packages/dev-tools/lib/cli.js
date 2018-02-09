function getEntry(name) {
  const index = process.argv.findIndex(entry => entry.startsWith(`--${name}`))
  if (index > 0) {
    return process.argv.slice(index, index + 2)
  }
  return []
}

function getString(name) {
  const entries = getEntry(name)
  return entries[1] || null
}

module.exports = {
  getString
}
