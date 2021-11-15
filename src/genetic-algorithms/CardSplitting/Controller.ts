import {
  Chromosome,
  Fitness,
  generateParent,
  randomInt,
  replaceOneGene,
  swapTwoGenes
} from '@jneander/genetics'

import {BaseController, PropagationOptions} from '../shared'
import SumProductMatch from './SumProductMatch'
import {CardSplittingChromosome, CardSplittingFitnessValue} from './types'

const geneSet = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10']

function mutate(
  parent: CardSplittingChromosome,
  geneSet: string[],
  getFitness: (
    chromosome: CardSplittingChromosome
  ) => Fitness<CardSplittingFitnessValue>,
  iterationCount: number
) {
  if (parent.genes.length === new Set(parent.genes).size) {
    return swapTwoGenes(
      parent,
      geneSet,
      getFitness,
      iterationCount,
      randomInt(1, 4)
    )
  }

  return replaceOneGene(parent, geneSet, getFitness, iterationCount)
}

export default class Controller extends BaseController<
  string,
  CardSplittingFitnessValue
> {
  private fitnessMethod: SumProductMatch

  constructor() {
    super()

    this.fitnessMethod = new SumProductMatch()
  }

  protected geneSet(): string[] {
    return geneSet
  }

  protected generateParent(): CardSplittingChromosome {
    return generateParent(10, geneSet, this.getFitness)
  }

  protected propogationOptions(): PropagationOptions<
    string,
    CardSplittingFitnessValue
  > {
    return {
      mutate: (parent: CardSplittingChromosome, iterationCount: number) =>
        mutate(parent, this.geneSet(), this.getFitness, iterationCount)
    }
  }

  protected randomTarget(): CardSplittingChromosome {
    const target = new Chromosome<string, CardSplittingFitnessValue>([], 0)
    target.fitness = this.fitnessMethod.getTargetFitness()
    return target
  }

  protected getFitness(
    chromosome: CardSplittingChromosome
  ): Fitness<CardSplittingFitnessValue> {
    return this.fitnessMethod.getFitness(chromosome)
  }
}
