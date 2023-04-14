import type {Chromosome} from '@jneander/genetics'

import type {ChessBoardPosition, State} from '../shared'

export type QueensGene = ChessBoardPosition
export type QueensChromosome = Chromosome<QueensGene>
export type QueensFitnessValueType = number

export type QueensState = State<ChessBoardPosition, number> & {
  boardSize: number
}
