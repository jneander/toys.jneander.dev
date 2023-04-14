import type {IEventBus} from '@jneander/event-bus'
import {ArrayMatch, Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'
import {sampleArrayValues} from '@jneander/utils-random'
import type {Store} from '@jneander/utils-state'

import {
  ControlsEvent,
  ControlsState,
  GeneticAlgorithmController,
  PropagationTarget,
  State,
} from '../shared'

const defaultLength = 50
const geneSet = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.'.split('')

function randomTarget(fitnessMethod: ArrayMatch<string>): PropagationTarget<string, number> {
  const genes = sampleArrayValues(geneSet, {count: defaultLength})

  const chromosome = new Chromosome<string>(genes)

  return {
    chromosome,
    fitness: fitnessMethod.getTargetFitness(chromosome),
  }
}

interface ControllerDependencies {
  controlsStore: Store<ControlsState>
  eventBus: IEventBus
  store: Store<State<string, number>>
}

export class Controller extends GeneticAlgorithmController<string, number> {
  private fitnessMethod: ArrayMatch<string>

  constructor(dependencies: ControllerDependencies) {
    super(dependencies)

    this.fitnessMethod = new ArrayMatch<string>()
  }

  initialize(): void {
    this.subscribeEvent(ControlsEvent.RANDOMIZE, () => {
      const genes = sampleArrayValues(geneSet, {count: defaultLength})
      const chromosome = new Chromosome<string>(genes)

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
      mutate: (parent: Chromosome<string>) => replaceOneGene(parent, geneSet),
      optimalFitness: this.target().fitness,
    }
  }

  private generateParent(): Chromosome<string> {
    const {chromosome} = this.target()

    if (chromosome == null) {
      throw new Error('Chromosome must exist on the target')
    }

    return randomChromosome(chromosome.genes.length, geneSet)
  }

  private getFitness(chromosome: Chromosome<string>): Fitness<number> {
    const {chromosome: targetChromosome} = this.target()

    if (targetChromosome == null) {
      throw new Error('Chromosome must exist on the target')
    }

    return this.fitnessMethod.getFitness(chromosome, targetChromosome)
  }

  private target(): PropagationTarget<string, number> {
    const {target} = this.store.getState()

    if (target == null) {
      throw new Error('Controller has not been initialized')
    }

    return target
  }
}
