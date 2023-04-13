import type {IEventBus} from '@jneander/event-bus'
import {ArrayMatch, Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'
import {sampleArrayValues} from '@jneander/utils-random'
import {Store} from '@jneander/utils-state'

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

  protected geneSet(): string[] {
    return geneSet
  }

  protected generateParent(): Chromosome<string> {
    const {chromosome} = this.target()

    if (chromosome == null) {
      throw new Error('Chromosome must exist on the target')
    }

    return randomChromosome(chromosome.genes.length, geneSet)
  }

  protected propogationOptions() {
    return {
      mutate: (parent: Chromosome<string>) => replaceOneGene(parent, this.geneSet()),
      optimalFitness: this.target().fitness,
    }
  }

  protected randomTarget(): PropagationTarget<string, number> {
    const genes = sampleArrayValues(this.geneSet(), {count: defaultLength})

    const chromosome = new Chromosome<string>(genes)

    return {
      chromosome,
      fitness: this.fitnessMethod.getTargetFitness(chromosome),
    }
  }

  protected getFitness(chromosome: Chromosome<string>): Fitness<number> {
    const {chromosome: targetChromosome} = this.target()

    if (targetChromosome == null) {
      throw new Error('Chromosome must exist on the target')
    }

    return this.fitnessMethod.getFitness(chromosome, targetChromosome)
  }

  private target(): PropagationTarget<string, number> {
    return this.store.getState().target
  }
}
