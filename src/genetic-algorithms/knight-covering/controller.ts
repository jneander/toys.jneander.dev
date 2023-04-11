import {Chromosome, Fitness, randomEntry, randomInt, range} from '@jneander/genetics'
import {Store} from '@jneander/utils-state'

import {
  allPositionsForBoard,
  BaseController,
  ChessBoardPosition,
  KNIGHT_UNICODE,
  PropagationOptions,
  PropagationTarget,
  State,
} from '../shared'
import {FewestAttacks} from './algorithms'
import {DEFAULT_BOARD_SIZE, minimumKnightsByBoardSize} from './constants'
import {listAttacks, positionFromHash, positionHash, randomPosition} from './helpers'
import {KnightCoveringFitnessValueType, KnightCoveringGene} from './types'

export class Controller extends BaseController<KnightCoveringGene, KnightCoveringFitnessValueType> {
  private _boardSize: number
  private _allBoardPositions: KnightCoveringGene[]
  private fitnessMethod: FewestAttacks

  constructor() {
    const optimalFitness = new FewestAttacks({boardSize: DEFAULT_BOARD_SIZE})

    const store = new Store<State<KnightCoveringGene, KnightCoveringFitnessValueType>>({
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
    this._allBoardPositions = allPositionsForBoard(this.boardSize, KNIGHT_UNICODE)

    this.randomizeTarget = this.randomizeTarget.bind(this)
  }

  get boardSize(): number {
    return this._boardSize
  }

  randomizeTarget(): void {
    this.setTarget(this.randomTarget())
    this.reset()
  }

  setBoardSize(size: number): void {
    this._boardSize = size
    this._allBoardPositions = allPositionsForBoard(this.boardSize, KNIGHT_UNICODE)
    this.fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    this.randomizeTarget()
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
      mutate: this.mutate.bind(this),
    }
  }

  protected randomTarget(): PropagationTarget<KnightCoveringGene, KnightCoveringFitnessValueType> {
    return {
      fitness: this.fitnessMethod.getTargetFitness(),
    }
  }

  protected getFitness(
    chromosome: Chromosome<KnightCoveringGene>,
  ): Fitness<KnightCoveringFitnessValueType> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  private mutate(chromosome: Chromosome<KnightCoveringGene>): Chromosome<KnightCoveringGene> {
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
        const [positionHash, knightIndexesAtPosition] = positionToKnightIndexArray[i]
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
          const positionsWhichCanAttackThisPosition: ChessBoardPosition[] = listAttacks(
            unattacked[i],
            this.boardSize,
          )

          potentialKnightPositions = [
            ...potentialKnightPositions,
            ...positionsWhichCanAttackThisPosition,
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

  protected get knightCount(): number {
    return minimumKnightsByBoardSize[this.boardSize]
  }

  protected get allBoardPositions(): KnightCoveringGene[] {
    if (this._allBoardPositions == null) {
      this._allBoardPositions = allPositionsForBoard(this.boardSize, KNIGHT_UNICODE)
    }

    return this._allBoardPositions
  }
}
