import {
  Chromosome,
  Fitness,
  randomChromosome,
  range,
  replaceOneGene
} from '@jneander/genetics'

import {BaseController, PropagationOptions, PropagationTarget} from '../shared'
import FewestAttacks from './FewestAttacks'
import {QueensState} from './types'

const DEFAULT_BOARD_SIZE = 8

export default class Controller extends BaseController<number, number> {
  private _boardSize: number | undefined
  private _fitnessMethod: FewestAttacks | undefined

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

  protected randomTarget(): PropagationTarget<number, number> {
    return {
      fitness: this.fitnessMethod.getTargetFitness()
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
