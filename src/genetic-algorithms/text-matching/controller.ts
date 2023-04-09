import {
  ArrayMatch,
  Chromosome,
  Fitness,
  randomChromosome,
  replaceOneGene,
  sampleArray,
} from '@jneander/genetics'

import {BaseController, PropagationOptions, PropagationTarget} from '../shared'

const defaultLength = 50
const geneSet = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.'.split('')

export class Controller extends BaseController<string, number> {
  private _fitnessMethod: ArrayMatch<string> | undefined

  protected geneSet(): string[] {
    return geneSet
  }

  protected generateParent(): Chromosome<string> {
    const {chromosome} = this.target()

    if (chromosome == null) {
      throw new Error('Chromosome must exist on the target')
    }

    return randomChromosome(chromosome.genes.length, geneSet)
  }

  protected propogationOptions(): PropagationOptions<string> {
    return {
      mutate: parent => replaceOneGene(parent, this.geneSet()),
    }
  }

  protected randomTarget(): PropagationTarget<string, number> {
    const genes = sampleArray(this.geneSet(), defaultLength)

    const chromosome = new Chromosome<string>(genes)

    return {
      chromosome,
      fitness: this.fitnessMethod.getTargetFitness(chromosome),
    }
  }

  protected getFitness(chromosome: Chromosome<string>): Fitness<number> {
    const {chromosome: targetChromosome} = this.target()

    if (targetChromosome == null) {
      throw new Error('Chromosome must exist on the target')
    }

    return this.fitnessMethod.getFitness(chromosome, targetChromosome)
  }

  protected get fitnessMethod() {
    if (this._fitnessMethod == null) {
      this._fitnessMethod = new ArrayMatch()
    }

    return this._fitnessMethod
  }
}
