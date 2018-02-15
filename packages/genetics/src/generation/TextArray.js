import Chromosome from '../Chromosome'
import {choice} from '../util'

function createPhraseArray(length, geneSet) {
  const phrase = []
  for (let i = 0; i < length; i++) {
    phrase.push(choice(geneSet))
  }
  return phrase
}

export default class TextArray {
  constructor(geneSet, fitnessMethod) {
    this.geneSet = geneSet
    this.fitnessMethod = fitnessMethod
  }

  generateTargetWithLength(length) {
    const targetArray = createPhraseArray(length, this.geneSet)
    const target = new Chromosome(targetArray, 0)
    target.fitness = this.fitnessMethod.getTargetFitness(target)
    return target
  }
}
