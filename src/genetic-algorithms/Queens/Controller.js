import {
  Chromosome,
  generateParent,
  range,
  replaceOneGene
} from '@jneander/genetics'

import BaseController from '../shared/Controller'
import FewestAttacks from './FewestAttacks'

export default class Controller extends BaseController {
  constructor() {
    super()

    this._boardSize = 8
    this.fitnessMethod = new FewestAttacks({boardSize: this._boardSize})
    this.getInitialState = this.getInitialState.bind(this)
  }

  generateParent() {
    return generateParent(this._boardSize * 2, this.geneSet(), this.getFitness)
  }

  geneSet() {
    return range(0, this._boardSize)
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      boardSize: this._boardSize
    }
  }

  propogationOptions() {
    return {
      mutate: (parent, iterationCount) =>
        replaceOneGene(parent, this.geneSet(), this.getFitness, iterationCount)
    }
  }

  randomTarget() {
    const target = new Chromosome([], null)
    target.fitness = this.fitnessMethod.getTargetFitness()
    return target
  }

  setBoardSize(size) {
    this._boardSize = size
    this.fitnessMethod = new FewestAttacks({boardSize: this._boardSize})
    this.randomizeTarget()
  }

  state() {
    return {
      boardSize: this._boardSize
    }
  }
}
