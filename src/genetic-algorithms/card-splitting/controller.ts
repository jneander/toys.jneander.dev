import {
  Fitness,
  randomChromosome,
  randomInt,
  replaceOneGene,
  swapTwoGenes,
} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import {BaseController, PropagationOptions, PropagationTarget, State} from '../shared'
import {SumProductMatch} from './sum-product-match'
import type {CardSplittingChromosome, CardSplittingFitnessValue} from './types'

const geneSet = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10']

function mutate(parent: CardSplittingChromosome, geneSet: string[]) {
  if (parent.genes.length === new Set(parent.genes).size) {
    return swapTwoGenes(parent, randomInt(1, 4))
  }

  return replaceOneGene(parent, geneSet)
}

export class Controller extends BaseController<string, CardSplittingFitnessValue> {
  private fitnessMethod: SumProductMatch

  constructor() {
    const optimalFitness = new SumProductMatch()

    const store = new Store<State<string, CardSplittingFitnessValue>>({
      allIterations: false,
      best: null,
      current: null,
      first: null,
      isRunning: false,
      iterationCount: 0,
      maxPropagationSpeed: true,
      playbackPosition: 1,
      propagationSpeed: 1,
      target: {
        fitness: optimalFitness.getTargetFitness(),
      },
    })

    super(store)

    this.fitnessMethod = optimalFitness

    this.randomizeTarget = this.randomizeTarget.bind(this)
  }

  randomizeTarget(): void {
    this.setTarget(this.randomTarget())
    this.reset()
  }

  protected geneSet(): string[] {
    return geneSet
  }

  protected generateParent(): CardSplittingChromosome {
    return randomChromosome(10, geneSet)
  }

  protected propogationOptions(): PropagationOptions<string> {
    return {
      mutate: (parent: CardSplittingChromosome) => mutate(parent, this.geneSet()),
    }
  }

  protected randomTarget(): PropagationTarget<string, CardSplittingFitnessValue> {
    return {
      fitness: this.fitnessMethod.getTargetFitness(),
    }
  }

  protected getFitness(chromosome: CardSplittingChromosome): Fitness<CardSplittingFitnessValue> {
    return this.fitnessMethod.getFitness(chromosome)
  }
}