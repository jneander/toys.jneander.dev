import {
  Chromosome,
  Fitness,
  randomChromosome,
  range,
  replaceOneGene
} from '@jneander/genetics'

import {BaseController, PropagationOptions, PropagationTarget} from '../shared'
import {FewestAttacks} from './algorithms'
import {DEFAULT_BOARD_SIZE} from './constants'
import {QueensState} from './types'

export default class Controller extends BaseController<number, number> {
  private _boardSize: number
  private _fitnessMethod: FewestAttacks | undefined

  constructor() {
    super()

    this._boardSize = DEFAULT_BOARD_SIZE
  }

  setBoardSize(size: number): void {
    this._boardSize = size
    this._fitnessMethod = new FewestAttacks({boardSize: this._boardSize})
    this.randomizeTarget()
  }

  protected state(): QueensState {
    return {
      boardSize: this._boardSize
    }
  }

  protected geneSet(): number[] {
    return range(0, this._boardSize)
  }

  protected generateParent() {
    return randomChromosome(this._boardSize * 2, this.geneSet())
  }

  protected propogationOptions(): PropagationOptions<number> {
    return {
      mutate: parent => replaceOneGene(parent, this.geneSet())
    }
  }

  protected randomTarget(): PropagationTarget<number, number> {
    return {
      fitness: this.fitnessMethod.getTargetFitness()
    }
  }

  protected getFitness(chromosome: Chromosome<number>): Fitness<number> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  protected get fitnessMethod() {
    if (this._fitnessMethod == null) {
      this._fitnessMethod = new FewestAttacks({boardSize: this._boardSize})
    }

    return this._fitnessMethod
  }
}
