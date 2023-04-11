import {
  ArrayOrder,
  ArrayOrderFitnessValue,
  Chromosome,
  Fitness,
  swapTwoGenes,
} from '@jneander/genetics'
import {rangeInts} from '@jneander/utils-arrays'
import {sampleArrayValues, shuffleArray} from '@jneander/utils-random'
import {Store} from '@jneander/utils-state'

import {BaseController, PropagationTarget, State} from '../shared'

const defaultLength = 50
const maxLength = 100
const geneSet = rangeInts(0, maxLength)

function randomTarget(
  fitnessMethod: ArrayOrder,
): PropagationTarget<number, ArrayOrderFitnessValue> {
  const genes = sampleArrayValues(geneSet, {count: defaultLength}).sort((a, b) => a - b)

  const chromosome = new Chromosome<number>(genes)

  return {
    chromosome,
    fitness: fitnessMethod.getTargetFitness(chromosome),
  }
}

export class Controller extends BaseController<number, ArrayOrderFitnessValue> {
  private fitnessMethod: ArrayOrder

  constructor() {
    const optimalFitness = new ArrayOrder()

    const store = new Store<State<number, ArrayOrderFitnessValue>>({
      allIterations: false,
      best: null,
      current: null,
      first: null,
      isRunning: false,
      iterationCount: 0,
      maxPropagationSpeed: true,
      playbackPosition: 1,
      propagationSpeed: 1,
      target: randomTarget(optimalFitness),
    })

    super(store)

    this.fitnessMethod = optimalFitness

    this.randomizeTarget = this.randomizeTarget.bind(this)
  }

  randomizeTarget(): void {
    this.setTarget(this.randomTarget())
    this.reset()
  }

  protected geneSet(): number[] {
    return geneSet
  }

  protected generateParent(): Chromosome<number> {
    const genes = shuffleArray(this.target().chromosome?.genes ?? [])
    return new Chromosome<number>(genes)
  }

  protected propogationOptions() {
    return {
      mutate: (parent: Chromosome<number>) => swapTwoGenes(parent),
      optimalFitness: this.target().fitness,
    }
  }

  protected randomTarget(): PropagationTarget<number, ArrayOrderFitnessValue> {
    const genes = sampleArrayValues(this.geneSet(), {count: defaultLength}).sort((a, b) => a - b)

    const chromosome = new Chromosome<number>(genes)

    return {
      chromosome,
      fitness: this.fitnessMethod.getTargetFitness(chromosome),
    }
  }

  protected getFitness(chromosome: Chromosome<number>): Fitness<ArrayOrderFitnessValue> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  private target(): PropagationTarget<number, ArrayOrderFitnessValue> {
    return this.store.getState().target
  }
}
