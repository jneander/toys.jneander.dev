import Chromosome from '@jneander/genetics/es/Chromosome'
import ArrayOrder from '@jneander/genetics/es/fitness/ArrayOrder'
import {generateParent} from '@jneander/genetics/es/generation'
import {replaceOneGene} from '@jneander/genetics/es/mutation'
import {sample} from '@jneander/genetics/es/util'

import ArrayMatch from '@jneander/genetics/es/fitness/ArrayMatch'

import BaseController from '../shared/Controller'

const defaultLength = 50
const geneSet = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.'.split('')

export default class Controller extends BaseController {
  constructor(state) {
    super(state)

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
