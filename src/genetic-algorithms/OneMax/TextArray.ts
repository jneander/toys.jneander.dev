import {ArrayMatch, Chromosome, randomEntry} from '@jneander/genetics'

function createPhraseArray(length: number, geneSet: string[]): string[] {
  const phrase = []

  for (let i = 0; i < length; i++) {
    phrase.push(randomEntry(geneSet))
  }

  return phrase
}

export default class TextArray {
  protected geneSet: string[]
  protected fitnessMethod: ArrayMatch<string>

  constructor(geneSet: string[]) {
    this.geneSet = geneSet
    this.fitnessMethod = new ArrayMatch<string>()
  }

  generateTargetWithLength(length: number): Chromosome<string, number> {
    const targetArray = createPhraseArray(length, this.geneSet)
    const target = new Chromosome<string, number>(targetArray, 0)
    target.fitness = this.fitnessMethod.getTargetFitness(target)

    return target
  }
}
