import {
  Chromosome,
  Fitness,
  randomEntry,
  randomInt,
  range
} from '@jneander/genetics'

import {BaseController, PropagationOptions, PropagationTarget} from '../shared'
import BoardCoverage from './BoardCoverage'
import {KnightCoveringState, Position} from './types'
import {
  allPositionsForBoard,
  listAttacks,
  positionFromHash,
  positionHash,
  randomPosition
} from './util'

const DEFAULT_BOARD_SIZE = 8

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
  private _allBoardPositions: Position[]
  private _fitnessMethod: BoardCoverage | undefined

  constructor() {
    super()

    this._boardSize = 8
    this._allBoardPositions = allPositionsForBoard(this._boardSize)
  }

  setBoardSize(size: number): void {
    this._boardSize = size
    this._allBoardPositions = allPositionsForBoard(this._boardSize)
    this._fitnessMethod = new BoardCoverage({boardSize: this._boardSize})
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

  protected generateParent(): Chromosome<Position> {
    const genes = []
    const usedPositionMap: {[key: string]: boolean} = {}

    while (genes.length < this.knightCount) {
      const position = randomPosition(this._boardSize)
      const mapKey = `${position.col},${position.row}`

      if (!usedPositionMap[mapKey]) {
        genes.push(position)
        usedPositionMap[mapKey] = true
      }
    }

    return new Chromosome<Position>(genes)
  }

  protected propogationOptions(): PropagationOptions<Position> {
    return {
      mutate: this.mutate.bind(this)
    }
  }

  protected randomTarget(): PropagationTarget<Position, number> {
    return {
      fitness: this.fitnessMethod.getTargetFitness()
    }
  }

  protected getFitness(chromosome: Chromosome<Position>): Fitness<number> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  private mutate(parent: Chromosome<Position>): Chromosome<Position> {
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
        potentialKnightPositions = [...this.allBoardPositions]
      }

      let indexOfGeneToReplace
      if (knightIndexes.size) {
        indexOfGeneToReplace = randomEntry(Array.from(knightIndexes))
      } else {
        indexOfGeneToReplace = randomInt(0, genes.length)
      }

      genes[indexOfGeneToReplace] = randomEntry(potentialKnightPositions)
    }

    return new Chromosome<Position>(genes)
  }

  protected get boardSize() {
    return this._boardSize || DEFAULT_BOARD_SIZE
  }

  protected get knightCount() {
    return minimumKnightsByBoardSize[this.boardSize]
  }

  protected get allBoardPositions() {
    if (this._allBoardPositions == null) {
      this._allBoardPositions = allPositionsForBoard(this.boardSize)
    }

    return this._allBoardPositions
  }

  protected get fitnessMethod() {
    if (this._fitnessMethod == null) {
      this._fitnessMethod = new BoardCoverage({boardSize: this.boardSize})
    }

    return this._fitnessMethod
  }
}
