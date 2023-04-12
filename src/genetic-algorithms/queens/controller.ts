import type {IEventBus} from '@jneander/event-bus'
import {Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import {
  allPositionsForBoard,
  BaseController,
  PropagationTarget,
  QUEEN_UNICODE,
  State,
} from '../shared'
import {FewestAttacks} from './algorithms'
import {DEFAULT_BOARD_SIZE} from './constants'
import type {QueensChromosome, QueensFitnessValueType, QueensGene} from './types'

export class Controller extends BaseController<QueensGene, QueensFitnessValueType> {
  private _boardSize: number
  private fitnessMethod: FewestAttacks

  constructor(eventBus: IEventBus) {
    const optimalFitness = new FewestAttacks({boardSize: DEFAULT_BOARD_SIZE})

    const store = new Store<State<QueensGene, QueensFitnessValueType>>({
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

    super(store, eventBus)

    this.fitnessMethod = optimalFitness

    this._boardSize = DEFAULT_BOARD_SIZE

    this.randomizeTarget = this.randomizeTarget.bind(this)
  }

  get boardSize(): number {
    return this._boardSize
  }

  randomizeTarget(): void {
    this.store.setState({
      target: this.randomTarget(),
    })

    this.reset()
  }

  setBoardSize(size: number): void {
    this._boardSize = size
    this.fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    this.randomizeTarget()
  }

  protected geneSet(): QueensGene[] {
    return allPositionsForBoard(this.boardSize, QUEEN_UNICODE)
  }

  protected generateParent(): QueensChromosome {
    return randomChromosome(this.boardSize, this.geneSet())
  }

  protected propogationOptions() {
    return {
      mutate: (parent: QueensChromosome) => replaceOneGene(parent, this.geneSet()),
      optimalFitness: this.target().fitness,
    }
  }

  protected randomTarget(): PropagationTarget<QueensGene, QueensFitnessValueType> {
    return {
      fitness: this.fitnessMethod.getTargetFitness(),
    }
  }

  protected getFitness(chromosome: Chromosome<QueensGene>): Fitness<QueensFitnessValueType> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  private target(): PropagationTarget<QueensGene, QueensFitnessValueType> {
    return this.store.getState().target
  }
}
