import type {IEventBus} from '@jneander/event-bus'
import {ArrayMatch, Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import {
  ControlsEvent,
  ControlsState,
  GeneticAlgorithmController,
  PropagationTarget,
  State,
} from '../shared'
import {TextArray} from './text-array'

const defaultLength = 150
const geneSet = ['0', '1']

function randomTarget(fitnessMethod: ArrayMatch<string>): PropagationTarget<string, number> {
  const generator = new TextArray(geneSet)
  const chromosome = generator.generateTargetWithLength(defaultLength)

  return {
    chromosome,
    fitness: fitnessMethod.getTargetFitness(chromosome),
  }
}

interface ControllerDependencies {
  controlsStore: Store<ControlsState>
  eventBus: IEventBus
}

export class Controller extends GeneticAlgorithmController<string, number> {
  private fitnessMethod: ArrayMatch<string>

  constructor(dependencies: ControllerDependencies) {
    const optimalFitness = new ArrayMatch<string>()

    const store = new Store<State<string, number>>({
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
      this.store.setState({
        target: this.randomTarget(),
      })

      this.reset()
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

    return randomChromosome<string>(chromosome.genes.length, geneSet)
  }

  private getFitness(chromosome: Chromosome<string>): Fitness<number> {
    const {chromosome: targetChromosome} = this.target()

    if (targetChromosome == null) {
      throw new Error('Chromosome must exist on the target')
    }

    return this.fitnessMethod.getFitness(chromosome, targetChromosome)
  }

  private randomTarget(): PropagationTarget<string, number> {
    const generator = new TextArray(geneSet)
    const chromosome = generator.generateTargetWithLength(defaultLength)

    return {
      chromosome,
      fitness: this.fitnessMethod.getTargetFitness(chromosome),
    }
  }

  private target(): PropagationTarget<string, number> {
    return this.store.getState().target
  }
}
