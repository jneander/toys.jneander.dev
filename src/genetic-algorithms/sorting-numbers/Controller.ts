import {
  ArrayOrder,
  ArrayOrderFitnessValue,
  Chromosome,
  Fitness,
  range,
  sampleArray,
  shuffleArray,
  swapTwoGenes,
} from '@jneander/genetics'

import {BaseController, PropagationOptions, PropagationTarget} from '../shared'

const defaultLength = 50
const maxLength = 100
const geneSet = range(0, maxLength)

export default class Controller extends BaseController<number, ArrayOrderFitnessValue> {
  private _fitnessMethod: ArrayOrder | undefined

  protected geneSet(): number[] {
    return geneSet
  }

  protected generateParent(): Chromosome<number> {
    const genes = shuffleArray(this.target().chromosome!.genes)
    return new Chromosome<number>(genes)
  }

  protected propogationOptions(): PropagationOptions<number> {
    return {
      mutate: parent => swapTwoGenes(parent),
    }
  }

  protected randomTarget(): PropagationTarget<number, ArrayOrderFitnessValue> {
    const genes = sampleArray(this.geneSet(), defaultLength).sort((a, b) => a - b)

    const chromosome = new Chromosome<number>(genes)

    return {
      chromosome,
      fitness: this.fitnessMethod.getTargetFitness(chromosome),
    }
  }

  protected getFitness(chromosome: Chromosome<number>): Fitness<ArrayOrderFitnessValue> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  protected get fitnessMethod() {
    if (this._fitnessMethod == null) {
      this._fitnessMethod = new ArrayOrder()
    }

    return this._fitnessMethod
  }
}
