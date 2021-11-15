import {
  ArrayOrder,
  Chromosome,
  Fitness,
  OrderFitnessValue,
  range,
  sampleArray,
  shuffleArray,
  swapTwoGenes
} from '@jneander/genetics'

import {BaseController, PropagationOptions} from '../shared'

const defaultLength = 50
const maxLength = 100
const geneSet = range(0, maxLength)

export default class Controller extends BaseController<
  number,
  OrderFitnessValue
> {
  private fitnessMethod: ArrayOrder

  constructor() {
    super()

    this.fitnessMethod = new ArrayOrder()
  }

  protected geneSet(): number[] {
    return geneSet
  }

  protected generateParent(): Chromosome<number, OrderFitnessValue> {
    const genes = shuffleArray(this.target()!.genes)

    const chromosome = new Chromosome<number, OrderFitnessValue>(genes, 1)
    chromosome.fitness = this.getFitness(chromosome)

    return chromosome
  }

  protected propogationOptions(): PropagationOptions<
    number,
    OrderFitnessValue
  > {
    return {
      mutate: (parent, iterationCount) =>
        swapTwoGenes(parent, this.geneSet(), this.getFitness, iterationCount)
    }
  }

  protected randomTarget(): Chromosome<number, OrderFitnessValue> {
    const genes = sampleArray(this.geneSet(), defaultLength).sort(
      (a, b) => a - b
    )
    const target = new Chromosome<number, OrderFitnessValue>(genes, 0)
    target.fitness = this.fitnessMethod.getTargetFitness(target)
    return target
  }

  protected getFitness(
    chromosome: Chromosome<number, OrderFitnessValue>
  ): Fitness<OrderFitnessValue> {
    return this.fitnessMethod.getFitness(chromosome)
  }
}
