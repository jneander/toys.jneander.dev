import {ArrayMatch, Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'

import {BaseController, PropagationOptions, PropagationTarget} from '../shared'
import {TextArray} from './text-array'

const defaultLength = 150
const geneSet = ['0', '1']

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

    return randomChromosome<string>(chromosome.genes.length, geneSet)
  }

  protected propogationOptions(): PropagationOptions<string> {
    return {
      mutate: (parent: Chromosome<string>) => replaceOneGene(parent, this.geneSet()),
    }
  }

  protected randomTarget(): PropagationTarget<string, number> {
    const generator = new TextArray(geneSet)
    const chromosome = generator.generateTargetWithLength(defaultLength)

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
