import {
  ArrayMatch,
  Chromosome,
  Fitness,
  generateParent,
  replaceOneGene,
  sampleArray
} from '@jneander/genetics'

import {BaseController, PropagationOptions} from '../shared'

const defaultLength = 50
const geneSet = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.'.split(
  ''
)

export default class Controller extends BaseController<string, number> {
  private fitnessMethod: ArrayMatch<string>

  constructor() {
    super()

    this.fitnessMethod = new ArrayMatch()
  }

  protected geneSet(): string[] {
    return geneSet
  }

  protected generateParent(): Chromosome<string, number> {
    return generateParent(this.target()!.genes.length, geneSet, this.getFitness)
  }

  protected propogationOptions(): PropagationOptions<string, number> {
    return {
      mutate: (parent, iterationCount) =>
        replaceOneGene(parent, this.geneSet(), this.getFitness, iterationCount)
    }
  }

  protected randomTarget(): Chromosome<string, number> {
    const genes = sampleArray(this.geneSet(), defaultLength).sort((a, b) =>
      a > b ? 1 : -1
    )

    const target = new Chromosome<string, number>(genes, 0)
    target.fitness = this.fitnessMethod.getTargetFitness(target)

    return target
  }

  protected getFitness(
    chromosome: Chromosome<string, number>
  ): Fitness<number> {
    return this.fitnessMethod.getFitness(chromosome, this.target()!)
  }
}
