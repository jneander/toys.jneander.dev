import {NumberFitness} from '@jneander/genetics'

import {hashGenes, positionKey} from './helpers'
import {QueensChromosome} from './types'

export type FewestAttacksConfig = {
  boardSize: number
}

export class FewestAttacks {
  private boardSize: number

  constructor({boardSize}: FewestAttacksConfig) {
    this.boardSize = boardSize
  }

  getFitness(current: QueensChromosome): NumberFitness {
    const geneHash = hashGenes(current.genes)

    const rowsWithQueens = new Set()
    const colsWithQueens = new Set()
    const northEastDiagonalsWithQueens = new Set()
    const southEastDiagonalsWithQueens = new Set()

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (geneHash[positionKey(row, col)]) {
          rowsWithQueens.add(row)
          colsWithQueens.add(col)
          northEastDiagonalsWithQueens.add(row + col)
          southEastDiagonalsWithQueens.add(this.boardSize - 1 - row + col)
        }
      }
    }

    const fitness =
      this.boardSize -
      rowsWithQueens.size +
      this.boardSize -
      colsWithQueens.size +
      this.boardSize -
      northEastDiagonalsWithQueens.size +
      this.boardSize -
      southEastDiagonalsWithQueens.size

    return new NumberFitness(fitness, false)
  }

  getTargetFitness(): NumberFitness {
    return new NumberFitness(0, false)
  }
}
