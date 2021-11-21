import {
  Chromosome,
  Fitness,
  randomEntry,
  randomInt,
  range
} from '@jneander/genetics'

import {
  BaseController,
  ChessBoardPosition,
  KNIGHT_UNICODE,
  PropagationOptions,
  PropagationTarget,
  allPositionsForBoard
} from '../shared'
import {FewestAttacks} from './algorithms'
import {DEFAULT_BOARD_SIZE, minimumKnightsByBoardSize} from './constants'
import {
  listAttacks,
  positionFromHash,
  positionHash,
  randomPosition
} from './helpers'
import {
  KnightCoveringFitnessValueType,
  KnightCoveringGene,
  KnightCoveringState
} from './types'

export default class Controller extends BaseController<
  KnightCoveringGene,
  KnightCoveringFitnessValueType
> {
  private _boardSize: number | undefined
  private _allBoardPositions: KnightCoveringGene[]
  private _fitnessMethod: FewestAttacks | undefined

  constructor() {
    super()

    this._allBoardPositions = allPositionsForBoard(
      this.boardSize,
      KNIGHT_UNICODE
    )
  }

  setBoardSize(size: number): void {
    this._boardSize = size
    this._allBoardPositions = allPositionsForBoard(
      this.boardSize,
      KNIGHT_UNICODE
    )
    this._fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    this.randomizeTarget()
  }

  protected state(): KnightCoveringState {
    return {
      boardSize: this.boardSize
    }
  }

  protected geneSet(): KnightCoveringGene[] {
    return this._allBoardPositions
  }

  protected generateParent(): Chromosome<KnightCoveringGene> {
    const genes: KnightCoveringGene[] = []
    const usedPositionMap: {[key: string]: boolean} = {}

    while (genes.length < this.knightCount) {
      const position = randomPosition(this.boardSize)
      const mapKey = `${position.col},${position.row}`

      if (!usedPositionMap[mapKey]) {
        genes.push(position)
        usedPositionMap[mapKey] = true
      }
    }

    return new Chromosome<KnightCoveringGene>(genes)
  }

  protected propogationOptions(): PropagationOptions<KnightCoveringGene> {
    return {
      mutate: this.mutate.bind(this)
    }
  }

  protected randomTarget(): PropagationTarget<
    KnightCoveringGene,
    KnightCoveringFitnessValueType
  > {
    return {
      fitness: this.fitnessMethod.getTargetFitness()
    }
  }

  protected getFitness(
    chromosome: Chromosome<KnightCoveringGene>
  ): Fitness<KnightCoveringFitnessValueType> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  private mutate(
    chromosome: Chromosome<KnightCoveringGene>
  ): Chromosome<KnightCoveringGene> {
    let count = randomInt(0, 10) === 0 ? 2 : 1
    const genes = [...chromosome.genes]

    while (count > 0) {
      count--

      const positionToKnightIndexes = new Map()
      for (let row = 0; row < this.boardSize; row++) {
        for (let col = 0; col < this.boardSize; col++) {
          positionToKnightIndexes.set(positionHash(row, col), [])
        }
      }

      for (let i = 0; i < genes.length; i++) {
        const attacks = listAttacks(genes[i], this.boardSize)
        for (let j = 0; j < attacks.length; j++) {
          const {row, col} = attacks[j]
          positionToKnightIndexes.get(positionHash(row, col)).push(i)
        }
      }

      const knightIndexes = new Set(range(0, genes.length))
      const unattacked: ChessBoardPosition[] = []

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

      let potentialKnightPositions: KnightCoveringGene[] = []
      if (unattacked.length) {
        for (let i = 0; i < unattacked.length; i++) {
          const positionsWhichCanAttackThisPosition: ChessBoardPosition[] =
            listAttacks(unattacked[i], this.boardSize)

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

    return new Chromosome<KnightCoveringGene>(genes)
  }

  protected get boardSize(): number {
    if (this._boardSize == null) {
      this._boardSize = DEFAULT_BOARD_SIZE
    }

    return this._boardSize
  }

  protected get knightCount(): number {
    return minimumKnightsByBoardSize[this.boardSize]
  }

  protected get allBoardPositions(): KnightCoveringGene[] {
    if (this._allBoardPositions == null) {
      this._allBoardPositions = allPositionsForBoard(
        this.boardSize,
        KNIGHT_UNICODE
      )
    }

    return this._allBoardPositions
  }

  protected get fitnessMethod() {
    if (this._fitnessMethod == null) {
      this._fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    }

    return this._fitnessMethod
  }
}
