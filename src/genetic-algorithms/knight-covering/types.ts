import type {Chromosome} from '@jneander/genetics'

import type {ChessBoardPosition, State} from '../shared'

export type KnightCoveringGene = ChessBoardPosition
export type KnightCoveringChromosome = Chromosome<KnightCoveringGene>
export type KnightCoveringFitnessValueType = number

export type KnightCoveringState = State<ChessBoardPosition, number> & {
  boardSize: number
}
