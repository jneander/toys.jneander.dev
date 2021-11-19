import {
  Chromosome,
  Fitness,
  PropagationRecord,
  randomChromosome,
  range,
  replaceOneGene
} from '@jneander/genetics'

import {BaseController, PropagationOptions} from '../shared'
import FewestAttacks from './FewestAttacks'
import {QueensState} from './types'

const DEFAULT_BOARD_SIZE = 8

export default class Controller extends BaseController<number, number> {
  private _boardSize: number | undefined
  private _fitnessMethod: FewestAttacks | undefined

  constructor() {
    super()

    this.getInitialState = this.getInitialState.bind(this)
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      boardSize: this.boardSize
    }
  }

  setBoardSize(size: number): void {
    this._boardSize = size
    this._fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    this.randomizeTarget()
  }

  protected state(): QueensState {
    return {
      boardSize: this.boardSize
    }
  }

  protected geneSet(): number[] {
    return range(0, this.boardSize)
  }

  protected generateParent() {
    return randomChromosome(this.boardSize * 2, this.geneSet())
  }

  protected propogationOptions(): PropagationOptions<number> {
    return {
      mutate: parent => replaceOneGene(parent, this.geneSet())
    }
  }

  // TODO: The target below is meaningless. Use explicit fitness instead of target.
  protected randomTarget(): PropagationRecord<number, number> {
    return {
      chromosome: new Chromosome<number>([]),
      fitness: this.fitnessMethod.getTargetFitness(),
      iteration: -1
    }
  }

  protected getFitness(chromosome: Chromosome<number>): Fitness<number> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  protected get boardSize() {
    return this._boardSize || DEFAULT_BOARD_SIZE
  }

  protected get fitnessMethod() {
    if (this._fitnessMethod == null) {
      this._fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    }

    return this._fitnessMethod
  }
}
