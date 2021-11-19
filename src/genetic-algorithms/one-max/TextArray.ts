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

  generateTargetWithLength(length: number): Chromosome<string> {
    const targetArray = createPhraseArray(length, this.geneSet)
    return new Chromosome<string>(targetArray)
  }
}
