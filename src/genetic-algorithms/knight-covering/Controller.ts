import {
  Chromosome,
  Fitness,
  randomEntry,
  randomInt,
  range
} from '@jneander/genetics'

import {BaseController, PropagationOptions} from '../shared'
import BoardCoverage from './BoardCoverage'
import {KnightCoveringState, Position} from './types'
import {
  allPositionsForBoard,
  listAttacks,
  positionFromHash,
  positionHash,
  randomPosition
} from './util'

const minimumKnightsByBoardSize: {[key: number]: number} = {
  4: 6,
  5: 7,
  6: 8,
  7: 10,
  8: 14,
  9: 18,
  10: 22,
  11: 25,
  12: 28,
  13: 33,
  14: 38,
  15: 45,
  16: 50,
  17: 58,
  18: 62,
  19: 68,
  20: 77
}

export default class Controller extends BaseController<Position, number> {
  private _boardSize: number
  private _knightCount: number
  private _allBoardPositions: Position[]
  private fitnessMethod: BoardCoverage

  constructor() {
    super()

    this._boardSize = 8
    this._knightCount = minimumKnightsByBoardSize[this._boardSize]
    this._allBoardPositions = allPositionsForBoard(this._boardSize)
    this.fitnessMethod = new BoardCoverage({boardSize: this._boardSize})

    this.getInitialState = this.getInitialState.bind(this)
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      boardSize: this._boardSize
    }
  }

  setBoardSize(size: number): void {
    this._boardSize = size
    this._knightCount = minimumKnightsByBoardSize[this._boardSize]
    this._allBoardPositions = allPositionsForBoard(this._boardSize)
    this.fitnessMethod = new BoardCoverage({boardSize: this._boardSize})
    this.randomizeTarget()
  }

  protected state(): KnightCoveringState {
    return {
      boardSize: this._boardSize
    }
  }

  protected geneSet(): Position[] {
    return this._allBoardPositions
  }

  protected generateParent(): Chromosome<Position, number> {
    const genes = []
    while (genes.length < this._knightCount) {
      genes.push(randomPosition(this._boardSize))
    }

    const chromosome = new Chromosome<Position, number>(genes, 0)
    chromosome.fitness = this.fitnessMethod.getFitness(chromosome)
    return chromosome
  }

  protected propogationOptions(): PropagationOptions<Position, number> {
    return {
      mutate: this.mutate.bind(this)
    }
  }

  protected randomTarget(): Chromosome<Position, number> {
    const target = new Chromosome<Position, number>([], 0)
    target.fitness = this.fitnessMethod.getTargetFitness()
    return target
  }

  protected getFitness(
    chromosome: Chromosome<Position, number>
  ): Fitness<number> {
    return this.getFitness(chromosome)
  }

  private mutate(
    parent: Chromosome<Position, number>,
    iteration: number
  ): Chromosome<Position, number> {
    let count = randomInt(0, 10) === 0 ? 2 : 1
    const genes = [...parent.genes]

    while (count > 0) {
      count--

      const positionToKnightIndexes = new Map()
      for (let row = 0; row < this._boardSize; row++) {
        for (let col = 0; col < this._boardSize; col++) {
          positionToKnightIndexes.set(positionHash(row, col), [])
        }
      }

      for (let i = 0; i < genes.length; i++) {
        const attacks = listAttacks(genes[i], this._boardSize)
        for (let j = 0; j < attacks.length; j++) {
          const {row, col} = attacks[j]
          positionToKnightIndexes.get(positionHash(row, col)).push(i)
        }
      }

      const knightIndexes = new Set(range(0, genes.length))
      const unattacked = []

      const positionToKnightIndexArray = Array.from(positionToKnightIndexes)
      for (let i = 0; i < positionToKnightIndexArray.length; i++) {
        const [positionHash, knightIndexesAtPosition] =
          positionToKnightIndexArray[i]
        if (knightIndexesAtPosition.length > 1) {
          continue
        }
        if (knightIndexesAtPosition.length === 0) {
          unattacked.push(positionFromHash(positionHash))
          continue
        }
        for (let j = 0; j < knightIndexesAtPosition.length; j++) {
          knightIndexes.delete(knightIndexesAtPosition[j])
        }
      }

      let potentialKnightPositions: Position[] = []
      if (unattacked.length) {
        for (let i = 0; i < unattacked.length; i++) {
          const positionsWhichCanAttackThisPosition = listAttacks(
            unattacked[i],
            this._boardSize
          )
          potentialKnightPositions = [
            ...potentialKnightPositions,
            ...positionsWhichCanAttackThisPosition
          ]
        }
      } else {
        potentialKnightPositions = [...this._allBoardPositions]
      }

      let indexOfGeneToReplace
      if (knightIndexes.size) {
        indexOfGeneToReplace = randomEntry(Array.from(knightIndexes))
      } else {
        indexOfGeneToReplace = randomInt(0, genes.length)
      }

      genes[indexOfGeneToReplace] = randomEntry(potentialKnightPositions)
    }

    const chromosome = new Chromosome<Position, number>(genes, iteration)
    chromosome.fitness = this.fitnessMethod.getFitness(chromosome)

    return chromosome
  }
}
