import {
  ArrayOrder,
  Chromosome,
  range,
  sample,
  shuffle,
  swapTwoGenes
} from '@jneander/genetics'

import BaseController from '../shared/Controller'

const defaultLength = 50
const maxLength = 100
const geneSet = range(0, maxLength)

export default class Controller extends BaseController {
  constructor() {
    super()

    this.fitnessMethod = new ArrayOrder()
  }

  generateParent() {
    const genes = shuffle(this.target().genes)
    const chromosome = new Chromosome(genes, 1)
    chromosome.fitness = this.getFitness(chromosome)
    return chromosome
  }

  geneSet() {
    return geneSet
  }

  propogationOptions() {
    return {
      mutate: (parent, iterationCount) =>
        swapTwoGenes(parent, this.geneSet(), this.getFitness, iterationCount)
    }
  }

  randomTarget() {
    const genes = sample(this.geneSet(), defaultLength).sort((a, b) => a - b)
    const target = new Chromosome(genes, null)
    target.fitness = this.fitnessMethod.getTargetFitness(target)
    return target
  }
}
