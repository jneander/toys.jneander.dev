import type {ChessBoardPosition} from '../shared'

export function positionKey(row: number, column: number) {
  return `${row},${column}`
}

export function hashGenes(genes: ChessBoardPosition[]) {
  const hash: {[key: string]: boolean} = {}

  for (let i = 0; i < genes.length; i++) {
    const {col, row} = genes[i]
    hash[positionKey(row, col)] = true
  }

  return hash
}
