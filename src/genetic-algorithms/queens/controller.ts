import type {IEventBus} from '@jneander/event-bus'
import {Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'
import type {Store} from '@jneander/utils-state'

import {
  allPositionsForBoard,
  ControlsEvent,
  ControlsState,
  GeneticAlgorithmController,
  PropagationTarget,
} from '../shared'
import {FewestAttacks} from './algorithms'
import type {QueensChromosome, QueensFitnessValueType, QueensGene, QueensState} from './types'

interface ControllerDependencies {
  controlsStore: Store<ControlsState>
  eventBus: IEventBus
  store: Store<QueensState>
}

export class Controller extends GeneticAlgorithmController<QueensGene, QueensFitnessValueType> {
  protected declare store: Store<QueensState>

  private fitnessMethod: FewestAttacks

  constructor(dependencies: ControllerDependencies) {
    super(dependencies)

    this.fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
  }

  initialize(): void {
    this.subscribeEvent(ControlsEvent.RANDOMIZE, () => {
      this.randomizeTarget()
    })

    this.store.setState({
      target: {
        fitness: this.fitnessMethod.getTargetFitness(),
      },
    })

    super.initialize()
  }

  setBoardSize(boardSize: number): void {
    this.store.setState({boardSize})
    this.fitnessMethod = new FewestAttacks({boardSize})
    this.randomizeTarget()
  }

  protected geneSet(): QueensGene[] {
    return allPositionsForBoard(this.boardSize, '♛')
  }

  protected propogationOptions() {
    return {
      calculateFitness: this.getFitness.bind(this),
      generateParent: this.generateParent.bind(this),
      mutate: (parent: QueensChromosome) => replaceOneGene(parent, this.geneSet()),
      optimalFitness: this.target().fitness,
    }
  }

  private get boardSize(): number {
    return this.store.getState().boardSize
  }

  private generateParent(): QueensChromosome {
    return randomChromosome(this.boardSize, this.geneSet())
  }

  private getFitness(chromosome: Chromosome<QueensGene>): Fitness<QueensFitnessValueType> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  private randomizeTarget(): void {
    this.store.setState({
      target: {
        fitness: this.fitnessMethod.getTargetFitness(),
      },
    })

    this.reset()
  }

  private target(): PropagationTarget<QueensGene, QueensFitnessValueType> {
    const {target} = this.store.getState()

    if (target == null) {
      throw new Error('Controller has not been initialized')
    }

    return target
  }
}
