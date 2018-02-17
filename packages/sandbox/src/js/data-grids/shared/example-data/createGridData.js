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

function createColumns(columnCount) {
  return buildLetterList(columnCount).map((key, index) => ({
    id: 1001 + index,
    data: {key, name: `Column ${key}`},
    key: key,
    name: `Column ${key}`,
    width: 100
  }))
}

function createRows(rowCount, columns) {
  return range(1, rowCount).map(key => ({
    id: 2000 + key,
    data: columns.reduce((map, column) => ({...map, [column.id]: `${column.key}${key}`}), {})
  }))
}

export default function createGridData(columnCount, rowCount) {
  const columns = createColumns(columnCount)
  return {
    columns,
    rows: createRows(rowCount, columns)
  }
}
