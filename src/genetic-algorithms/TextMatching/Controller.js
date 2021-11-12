import {
  ArrayMatch,
  Chromosome,
  generateParent,
  replaceOneGene,
  sample
} from '@jneander/genetics'

import BaseController from '../shared/Controller'

const defaultLength = 50
const geneSet = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.'.split(
  ''
)

export default class Controller extends BaseController {
  constructor() {
    super()

    this.fitnessMethod = new ArrayMatch()
  }

  generateParent() {
    return generateParent(this.target().genes.length, geneSet, this.getFitness)
  }

  geneSet() {
    return geneSet
  }

  propogationOptions() {
    return {
      mutate: (parent, iterationCount) =>
        replaceOneGene(parent, this.geneSet(), this.getFitness, iterationCount)
    }
  }

  randomTarget() {
    const genes = sample(this.geneSet(), defaultLength).sort((a, b) => a - b)
    const target = new Chromosome(genes, null)
    target.fitness = this.fitnessMethod.getTargetFitness(target)
    return target
  }
}
