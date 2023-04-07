import {Chromosome, Fitness, randomChromosome, replaceOneGene} from '@jneander/genetics'

import {
  BaseController,
  PropagationOptions,
  PropagationTarget,
  QUEEN_UNICODE,
  allPositionsForBoard,
} from '../shared'
import {FewestAttacks} from './algorithms'
import {DEFAULT_BOARD_SIZE} from './constants'
import {QueensChromosome, QueensFitnessValueType, QueensGene, QueensState} from './types'

export default class Controller extends BaseController<QueensGene, QueensFitnessValueType> {
  private _boardSize: number | undefined
  private _fitnessMethod: FewestAttacks | undefined

  setBoardSize(size: number): void {
    this._boardSize = size
    this._fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    this.randomizeTarget()
  }

  protected state(): QueensState {
    return {
      boardSize: this.boardSize,
    }
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

  protected get boardSize(): number {
    if (this._boardSize == null) {
      this._boardSize = DEFAULT_BOARD_SIZE
    }

    return this._boardSize
  }

  protected get fitnessMethod(): FewestAttacks {
    if (this._fitnessMethod == null) {
      this._fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    }

    return this._fitnessMethod
  }
}
