import type {IEventBus} from '@jneander/event-bus'
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

import {
  ControlsEvent,
  ControlsState,
  GeneticAlgorithmController,
  PropagationTarget,
  State,
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
}

export class Controller extends GeneticAlgorithmController<number, ArrayOrderFitnessValue> {
  private fitnessMethod: ArrayOrder

  constructor(dependencies: ControllerDependencies) {
    const optimalFitness = new ArrayOrder()

    const store = new Store<State<number, ArrayOrderFitnessValue>>({
      best: null,
      current: null,
      first: null,
      target: randomTarget(optimalFitness),
    })

    super({...dependencies, store})

    this.fitnessMethod = optimalFitness
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
    return this.store.getState().target
  }
}
