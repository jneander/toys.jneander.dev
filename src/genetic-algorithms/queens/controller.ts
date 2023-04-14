import type {IEventBus} from '@jneander/event-bus'
import {Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'
import type {Store} from '@jneander/utils-state'

import {
  allPositionsForBoard,
  ControlsEvent,
  ControlsState,
  GeneticAlgorithmController,
  PropagationTarget,
  QUEEN_UNICODE,
  State,
} from '../shared'
import {FewestAttacks} from './algorithms'
import {DEFAULT_BOARD_SIZE} from './constants'
import type {QueensChromosome, QueensFitnessValueType, QueensGene} from './types'

interface ControllerDependencies {
  controlsStore: Store<ControlsState>
  eventBus: IEventBus
  store: Store<State<QueensGene, QueensFitnessValueType>>
}

export class Controller extends GeneticAlgorithmController<QueensGene, QueensFitnessValueType> {
  private _boardSize: number
  private fitnessMethod: FewestAttacks

  constructor(dependencies: ControllerDependencies) {
    super(dependencies)

    this._boardSize = DEFAULT_BOARD_SIZE
    this.fitnessMethod = new FewestAttacks({boardSize: this._boardSize})
  }

  get boardSize(): number {
    return this._boardSize
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

  setBoardSize(size: number): void {
    this._boardSize = size
    this.fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    this.randomizeTarget()
  }

  protected geneSet(): QueensGene[] {
    return allPositionsForBoard(this.boardSize, QUEEN_UNICODE)
  }

  protected propogationOptions() {
    return {
      calculateFitness: this.getFitness.bind(this),
      generateParent: this.generateParent.bind(this),
      mutate: (parent: QueensChromosome) => replaceOneGene(parent, this.geneSet()),
      optimalFitness: this.target().fitness,
    }
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
