import {Chromosome} from '@jneander/genetics'

export type Position = {
  col: number
  row: number
}

export type KnightCoveringChromosome = Chromosome<Position, number>

export type KnightCoveringState = {
  boardSize: number
}
