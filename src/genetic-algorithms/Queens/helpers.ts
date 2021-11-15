export function positionKey(row: number, column: number) {
  return `${row},${column}`
}

export function hashGenes(genes: number[]) {
  const hash: {[key: string]: boolean} = {}

  for (let i = 0; i < genes.length; i += 2) {
    hash[positionKey(genes[i], genes[i + 1])] = true
  }

  return hash
}
