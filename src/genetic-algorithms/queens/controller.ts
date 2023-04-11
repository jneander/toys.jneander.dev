import {Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import {
  allPositionsForBoard,
  BaseController,
  PropagationOptions,
  PropagationTarget,
  QUEEN_UNICODE,
  State,
} from '../shared'
import {FewestAttacks} from './algorithms'
import {DEFAULT_BOARD_SIZE} from './constants'
import {QueensChromosome, QueensFitnessValueType, QueensGene} from './types'

export class Controller extends BaseController<QueensGene, QueensFitnessValueType> {
  private _boardSize: number
  private fitnessMethod: FewestAttacks

  constructor() {
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

    super(store)

    this.fitnessMethod = optimalFitness

    this._boardSize = DEFAULT_BOARD_SIZE
  }

  get boardSize(): number {
    return this._boardSize
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

  protected propogationOptions(): PropagationOptions<QueensGene> {
    return {
      mutate: parent => replaceOneGene(parent, this.geneSet()),
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
}
