import type {IEventBus} from '@jneander/event-bus'
import {Chromosome, Fitness} from '@jneander/genetics'
import {rangeInts} from '@jneander/utils-arrays'
import {MathRandomNumberGenerator, randomArrayValue} from '@jneander/utils-random'
import type {Store} from '@jneander/utils-state'

import {
  allPositionsForBoard,
  ChessBoardPosition,
  ControlsEvent,
  ControlsState,
  GeneticAlgorithmController,
  KNIGHT_UNICODE,
  PropagationTarget,
} from '../shared'
import {FewestAttacks} from './algorithms'
import {minimumKnightsByBoardSize} from './constants'
import {listAttacks, positionFromHash, positionHash, randomPosition} from './helpers'
import type {KnightCoveringFitnessValueType, KnightCoveringGene, KnightCoveringState} from './types'

const rng = new MathRandomNumberGenerator()

interface ControllerDependencies {
  controlsStore: Store<ControlsState>
  eventBus: IEventBus
  store: Store<KnightCoveringState>
}

export class Controller extends GeneticAlgorithmController<
  KnightCoveringGene,
  KnightCoveringFitnessValueType
> {
  protected declare store: Store<KnightCoveringState>

  private _allBoardPositions: KnightCoveringGene[]
  private fitnessMethod: FewestAttacks

  constructor(dependencies: ControllerDependencies) {
    super(dependencies)

    this.fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    this._allBoardPositions = allPositionsForBoard(this.boardSize, KNIGHT_UNICODE)
  }

  initialize(): void {
    this.subscribeEvent(ControlsEvent.RANDOMIZE, () => {
      this.randomizeTarget()
    })

    this.store.setState({
      target: {
        fitness: this.fitnessMethod.getTargetFitness(),
      },
    })

    super.initialize()
  }

  setBoardSize(boardSize: number): void {
    this.store.setState({boardSize})
    this._allBoardPositions = allPositionsForBoard(this.boardSize, KNIGHT_UNICODE)
    this.fitnessMethod = new FewestAttacks({boardSize: this.boardSize})
    this.randomizeTarget()
  }

  protected propogationOptions() {
    return {
      calculateFitness: this.getFitness.bind(this),
      generateParent: this.generateParent.bind(this),
      mutate: this.mutate.bind(this),
      optimalFitness: this.target().fitness,
    }
  }

  private get boardSize(): number {
    return this.store.getState().boardSize
  }

  private get knightCount(): number {
    return minimumKnightsByBoardSize[this.boardSize]
  }

  private get allBoardPositions(): KnightCoveringGene[] {
    if (this._allBoardPositions == null) {
      this._allBoardPositions = allPositionsForBoard(this.boardSize, KNIGHT_UNICODE)
    }

    return this._allBoardPositions
  }

  private generateParent(): Chromosome<KnightCoveringGene> {
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

  private getFitness(
    chromosome: Chromosome<KnightCoveringGene>,
  ): Fitness<KnightCoveringFitnessValueType> {
    return this.fitnessMethod.getFitness(chromosome)
  }

  private mutate(chromosome: Chromosome<KnightCoveringGene>): Chromosome<KnightCoveringGene> {
    let count = rng.nextInt32(0, 10) === 0 ? 2 : 1
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

      const knightIndexes = new Set(rangeInts(0, genes.length))
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
        indexOfGeneToReplace = randomArrayValue(Array.from(knightIndexes))
      } else {
        indexOfGeneToReplace = rng.nextInt32(0, genes.length)
      }

      genes[indexOfGeneToReplace] = randomArrayValue(potentialKnightPositions)
    }

    return new Chromosome<KnightCoveringGene>(genes)
  }

  private randomizeTarget(): void {
    this.store.setState({
      target: {
        fitness: this.fitnessMethod.getTargetFitness(),
      },
    })

    this.reset()
  }

  private target(): PropagationTarget<KnightCoveringGene, KnightCoveringFitnessValueType> {
    const {target} = this.store.getState()

    if (target == null) {
      throw new Error('Controller has not been initialized')
    }

    return target
  }
}
