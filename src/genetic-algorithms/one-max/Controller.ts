import {
  ArrayMatch,
  Chromosome,
  Fitness,
  randomChromosome,
  replaceOneGene
} from '@jneander/genetics'

import {BaseController, PropagationOptions, PropagationTarget} from '../shared'
import TextArray from './TextArray'

const defaultLength = 150
const geneSet = ['0', '1']

export default class Controller extends BaseController<string, number> {
  private _fitnessMethod: ArrayMatch<string> | undefined

  protected geneSet(): string[] {
    return geneSet
  }

  protected generateParent(): Chromosome<string> {
    return randomChromosome<string>(
      this.target().chromosome!.genes.length,
      geneSet
    )
  }

  protected propogationOptions(): PropagationOptions<string> {
    return {
      mutate: (parent: Chromosome<string>) =>
        replaceOneGene(parent, this.geneSet())
    }
  }

  protected randomTarget(): PropagationTarget<string, number> {
    const generator = new TextArray(geneSet)
    const chromosome = generator.generateTargetWithLength(defaultLength)

    return {
      chromosome,
      fitness: this.fitnessMethod.getTargetFitness(chromosome)
    }
  }

  protected getFitness(chromosome: Chromosome<string>): Fitness<number> {
    return this.fitnessMethod.getFitness(chromosome, this.target().chromosome!)
  }

  protected get fitnessMethod() {
    if (this._fitnessMethod == null) {
      this._fitnessMethod = new ArrayMatch()
    }

    return this._fitnessMethod
  }
}
