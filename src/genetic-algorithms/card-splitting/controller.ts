import type {IEventBus} from '@jneander/event-bus'
import {Fitness, randomChromosome, replaceOneGene, swapTwoGenes} from '@jneander/genetics'
import {MathRandomNumberGenerator} from '@jneander/utils-random'
import {Store} from '@jneander/utils-state'

import {
  ControlsEvent,
  ControlsState,
  GeneticAlgorithmController,
  PropagationTarget,
  State,
} from '../shared'
import {SumProductMatch} from './sum-product-match'
import type {CardSplittingChromosome, CardSplittingFitnessValue} from './types'

const geneSet = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10']

const rng = new MathRandomNumberGenerator()
const randomUint32Fn = rng.nextInt32.bind(rng)

function mutate(parent: CardSplittingChromosome, geneSet: string[]) {
  if (parent.genes.length === new Set(parent.genes).size) {
    /*
     * This algorithm appears to depend on multiple swaps happening between
     * fitness calculations. Otherwise, it evidently will not achieve optimal
     * fitness.
     */
    const swapCount = randomUint32Fn(1, 3)
    let result = parent

    for (let i = 0; i < swapCount; i++) {
      result = swapTwoGenes(result, {randomUint32Fn})
    }

    return result
  }

  return replaceOneGene(parent, geneSet)
}

interface ControllerDependencies {
  controlsStore: Store<ControlsState>
  eventBus: IEventBus
}

export class Controller extends GeneticAlgorithmController<string, CardSplittingFitnessValue> {
  private fitnessMethod: SumProductMatch

  constructor(dependencies: ControllerDependencies) {
    const store = new Store<State<string, CardSplittingFitnessValue>>({
      best: null,
      current: null,
      first: null,
      target: null,
    })

    super({...dependencies, store})

    this.fitnessMethod = new SumProductMatch()
  }

  initialize(): void {
    this.subscribeEvent(ControlsEvent.RANDOMIZE, () => {
      this.store.setState({
        target: this.randomTarget(),
      })

      this.reset()
    })

    this.store.setState({
      target: {
        fitness: this.fitnessMethod.getTargetFitness(),
      },
    })

    super.initialize()
  }

  protected propogationOptions() {
    return {
      calculateFitness: this.getFitness.bind(this),
      generateParent: this.generateParent.bind(this),
      mutate: (parent: CardSplittingChromosome) => mutate(parent, geneSet),
      optimalFitness: this.target().fitness,
    }
  }

  private generateParent(): CardSplittingChromosome {
    return randomChromosome(10, geneSet)
  }

  private getFitness(chromosome: CardSplittingChromosome): Fitness<CardSplittingFitnessValue> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  private randomTarget(): PropagationTarget<string, CardSplittingFitnessValue> {
    return {
      fitness: this.fitnessMethod.getTargetFitness(),
    }
  }

  private target(): PropagationTarget<string, CardSplittingFitnessValue> {
    const {target} = this.store.getState()

    if (target == null) {
      throw new Error('Controller has not been initialized')
    }

    return target
  }
}
