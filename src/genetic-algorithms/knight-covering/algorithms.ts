import {Fitness, NumberFitness} from '@jneander/genetics'

import {KnightCoveringChromosome} from './types'
import {listAttacks, positionHash} from './util'

export type FewestAttacksConfig = {
  boardSize: number
}

export class FewestAttacks {
  private boardSize: number

  constructor({boardSize}: FewestAttacksConfig) {
    this.boardSize = boardSize
  }

  getFitness(current: KnightCoveringChromosome): Fitness<number> {
    const attackHashSet = new Set()

    for (let i = 0; i < current.genes.length; i++) {
      const attacks = listAttacks(current.genes[i], this.boardSize)
      for (let j = 0; j < attacks.length; j++) {
        attackHashSet.add(positionHash(attacks[j].row, attacks[j].col))
      }
    }

    return new NumberFitness(attackHashSet.size, true)
  }

  getTargetFitness(): Fitness<number> {
    return new NumberFitness(this.boardSize ** 2, true)
  }
}
