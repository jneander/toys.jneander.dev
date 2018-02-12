import Chromosome from '@jneander/genetics/es/Chromosome'
import {generateParent} from '@jneander/genetics/es/generation'
import {replaceOneGene, swapTwoGenes} from '@jneander/genetics/es/mutation'
import {randomInt} from '@jneander/genetics/es/util'

import BaseController from '../shared/Controller'

import SumProductMatch from './SumProductMatch'

const geneSet = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10']

function mutate(parent, geneSet, getFitness, iterationCount) {
  if (parent.genes.length === new Set(parent.genes).size) {
    return swapTwoGenes(parent, geneSet, getFitness, iterationCount, randomInt(1, 4))
  }

  return replaceOneGene(parent, geneSet, getFitness, iterationCount)
}

export default class Controller extends BaseController {
  constructor(state) {
    super(state)

    this.fitnessMethod = new SumProductMatch()
  }

  generateParent() {
    return generateParent(10, geneSet, this.getFitness)
  }

  geneSet() {
    return geneSet
  }

  propogationOptions() {
    return {
      mutate: (parent, iterationCount) =>
        mutate(parent, this.geneSet(), this.getFitness, iterationCount)
    }
  }

  randomTarget() {
    const target = new Chromosome([], null)
    target.fitness = this.fitnessMethod.getTargetFitness()
    return target
  }
}
