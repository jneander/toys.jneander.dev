import {
  ArrayMatch,
  Chromosome,
  Fitness,
  PropagationRecord,
  randomChromosome,
  replaceOneGene,
  sampleArray
} from '@jneander/genetics'

import {BaseController, PropagationOptions} from '../shared'

const defaultLength = 50
const geneSet = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.'.split(
  ''
)

export default class Controller extends BaseController<string, number> {
  private _fitnessMethod: ArrayMatch<string> | undefined

  protected geneSet(): string[] {
    return geneSet
  }

  protected generateParent(): Chromosome<string> {
    return randomChromosome(this.target().chromosome.genes.length, geneSet)
  }

  protected propogationOptions(): PropagationOptions<string> {
    return {
      mutate: parent => replaceOneGene(parent, this.geneSet())
    }
  }

  protected randomTarget(): PropagationRecord<string, number> {
    const genes = sampleArray(this.geneSet(), defaultLength).sort((a, b) =>
      a > b ? 1 : -1
    )

    const chromosome = new Chromosome<string>(genes)

    return {
      chromosome,
      fitness: this.fitnessMethod.getTargetFitness(chromosome),
      iteration: -1
    }
  }

  protected getFitness(chromosome: Chromosome<string>): Fitness<number> {
    return this.fitnessMethod.getFitness(chromosome, this.target().chromosome)
  }

  protected get fitnessMethod() {
    if (this._fitnessMethod == null) {
      this._fitnessMethod = new ArrayMatch()
    }

    return this._fitnessMethod
  }
}
