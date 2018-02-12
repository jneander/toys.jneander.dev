function shuffleArray(array) {
  for (let i = array.length; i; i--) {
    let j = Math.floor(Math.random() * i)
    ;[array[i - 1], array[j]] = [array[j], array[i - 1]]
  }
  return array
}

export function shuffle(stringOrArray) {
  if (stringOrArray instanceof String) {
    return shuffleArray(stringOrArray.split('')).join('')
  }
  return shuffleArray([...stringOrArray])
}

export function randomInt(min, max) {
  const minInt = Math.ceil(min)
  const maxInt = Math.floor(max)
  return Math.floor(Math.random() * (maxInt - minInt)) + minInt
}

export function sample(array, count = 1) {
  return shuffle(array).slice(0, count)
}

export function choice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function range(start, end) {
  return Array.from({length: end - start}, (value, key) => key + start)
}

export function sum(array) {
  return array.reduce((sum, value) => sum + value, 0)
}

export function product(array) {
  return array.reduce((sum, value) => sum * value, 1)
}
