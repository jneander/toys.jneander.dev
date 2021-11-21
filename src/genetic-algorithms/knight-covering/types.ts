import {Chromosome} from '@jneander/genetics'

import {ChessBoardPosition} from '../shared'

export type KnightCoveringGene = ChessBoardPosition
export type KnightCoveringChromosome = Chromosome<KnightCoveringGene>
export type KnightCoveringFitnessValueType = number

export type KnightCoveringState = {
  boardSize: number
}
