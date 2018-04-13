function addMaps(data) {
  data.columnMap = data.columns.reduce((map, column) => ({...map, [column.id]: column}), {})
  data.rowMap = data.rows.reduce((map, row) => ({...map, [row.id]: row}), {})
}

function getLettersForCharacterIndex(charIndex, list = []) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const thisIndex = charIndex % letters.length
  list.unshift(letters[thisIndex])

  if (charIndex >= letters.length) {
    const nextIndex = (charIndex - thisIndex) / letters.length - 1
    return getLettersForCharacterIndex(nextIndex, list)
  } else {
    return list.join('')
  }
}

function buildLetterList(count) {
  const list = []
  for (var i = 0; i < count; i++) {
    list.push(getLettersForCharacterIndex(i))
  }
  return list
}

function range(start, end) {
  const list = []
  for (var i = start; i <= end; i++) {
    list.push(i)
  }
  return list
}

/* Keyed Data: A1, A2, B1, B2, etc. */

export const keyedData = {}

keyedData.columns = buildLetterList(26).map((key, index) => ({
  id: 1001 + index,
  data: {key, name: `Column ${key}`},
  key: key,
  name: `Column ${key}`,
  width: 100
}))

keyedData.rows = range(1, 12).map(key => ({
  id: 2000 + key,
  data: keyedData.columns.reduce(
    (map, column) => ({...map, [column.id]: `${column.key}${key}`}),
    {}
  )
}))

addMaps(keyedData)

/* Other Examples ......... */

export default {
  keyedData
}
