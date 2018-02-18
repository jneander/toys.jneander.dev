import Chromosome from '@jneander/genetics/es/Chromosome'
import ArrayMatch from '@jneander/genetics/es/fitness/ArrayMatch'
import {generateParent} from '@jneander/genetics/es/generation'
import TextArray from '@jneander/genetics/es/generation/TextArray'
import {replaceOneGene} from '@jneander/genetics/es/mutation'
import {sample} from '@jneander/genetics/es/util'

import BaseController from '../shared/Controller'

const defaultLength = 150
const geneSet = ['0', '1']

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
    const generator = new TextArray(geneSet, this.fitnessMethod)
    const target = generator.generateTargetWithLength(defaultLength)

    // const genes = sample(this.geneSet(), defaultLength).sort((a, b) => a - b);
    // const target = new Chromosome(genes, null);
    target.fitness = this.fitnessMethod.getTargetFitness(target)
    return target
  }
}
