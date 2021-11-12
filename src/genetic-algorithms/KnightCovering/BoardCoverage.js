import {Fitness} from '@jneander/genetics'

import {listAttacks, positionHash} from './util'

function positionKey(row, column) {
  return `${row},${column}`
}

function hashGenes(genes) {
  const hash = {}
  for (let i = 0; i < genes.length; i += 2) {
    hash[positionKey(genes[i], genes[i + 1])] = true
  }
  return hash
}

export default class FewestAttacks {
  constructor(config) {
    this.config = config
  }

  getFitness(current) {
    const attackHashSet = new Set()

    for (let i = 0; i < current.genes.length; i++) {
      const attacks = listAttacks(current.genes[i], this.config.boardSize)
      for (let j = 0; j < attacks.length; j++) {
        attackHashSet.add(positionHash(attacks[j].row, attacks[j].col))
      }
    }

    return new Fitness(attackHashSet.size, true)
  }

  getTargetFitness() {
    return new Fitness(this.config.boardSize * this.config.boardSize, true)
  }
}
