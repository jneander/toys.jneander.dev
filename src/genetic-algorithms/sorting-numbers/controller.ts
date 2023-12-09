import type {IEventBus} from '@jneander/event-bus'
import {
  ArrayOrder,
  type ArrayOrderFitnessValue,
  Chromosome,
  type Fitness,
  swapTwoGenes,
} from '@jneander/genetics'
import {rangeInts} from '@jneander/utils-arrays'
import {sampleArrayValues, shuffleArray} from '@jneander/utils-random'
import type {Store} from '@jneander/utils-state'

import {
  ControlsEvent,
  type ControlsState,
  GeneticAlgorithmController,
  type PropagationTarget,
  type State,
} from '../shared'

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

interface ControllerDependencies {
  controlsStore: Store<ControlsState>
  eventBus: IEventBus
  store: Store<State<number, ArrayOrderFitnessValue>>
}

export class Controller extends GeneticAlgorithmController<number, ArrayOrderFitnessValue> {
  private fitnessMethod: ArrayOrder

  constructor(dependencies: ControllerDependencies) {
    super(dependencies)

    this.fitnessMethod = new ArrayOrder()
  }

  initialize(): void {
    this.subscribeEvent(ControlsEvent.RANDOMIZE, () => {
      const genes = sampleArrayValues(geneSet, {count: defaultLength}).sort((a, b) => a - b)
      const chromosome = new Chromosome<number>(genes)

      this.store.setState({
        target: {
          chromosome,
          fitness: this.fitnessMethod.getTargetFitness(chromosome),
        },
      })

      this.reset()
    })

    this.store.setState({
      target: randomTarget(this.fitnessMethod),
    })

    super.initialize()
  }

  protected propogationOptions() {
    return {
      calculateFitness: this.getFitness.bind(this),
      generateParent: this.generateParent.bind(this),
      mutate: (parent: Chromosome<number>) => swapTwoGenes(parent),
      optimalFitness: this.target().fitness,
    }
  }

  private generateParent(): Chromosome<number> {
    const genes = shuffleArray(this.target().chromosome?.genes ?? [])

    return new Chromosome<number>(genes)
  }

  private getFitness(chromosome: Chromosome<number>): Fitness<ArrayOrderFitnessValue> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  private target(): PropagationTarget<number, ArrayOrderFitnessValue> {
    const {target} = this.store.getState()

    if (target == null) {
      throw new Error('Controller has not been initialized')
    }

    return target
  }
}
