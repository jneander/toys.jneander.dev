import {
  Chromosome,
  Fitness,
  generateParent,
  range,
  replaceOneGene
} from '@jneander/genetics'

import {BaseController, PropagationOptions} from '../shared'
import FewestAttacks from './FewestAttacks'
import {QueensState} from './types'

export default class Controller extends BaseController<number, number> {
  private boardSize: number
  private fitnessMethod: FewestAttacks

  constructor() {
    super()

    this.boardSize = 8
    this.fitnessMethod = new FewestAttacks({boardSize: this.boardSize})

    this.getInitialState = this.getInitialState.bind(this)
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      boardSize: this.boardSize
    }
  }

  setBoardSize(size: number): void {
    this.boardSize = size
    this.fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
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
    return generateParent(this.boardSize * 2, this.geneSet(), this.getFitness)
  }

  protected propogationOptions(): PropagationOptions<number, number> {
    return {
      mutate: (parent, iterationCount) =>
        replaceOneGene(parent, this.geneSet(), this.getFitness, iterationCount)
    }
  }

  protected randomTarget(): Chromosome<number, number> {
    const target = new Chromosome<number, number>([], 0)
    target.fitness = this.fitnessMethod.getTargetFitness()
    return target
  }

  protected getFitness(
    chromosome: Chromosome<number, number>
  ): Fitness<number> {
    return this.fitnessMethod.getFitness(chromosome)
  }
}
