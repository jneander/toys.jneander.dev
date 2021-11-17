import {Chromosome} from '@jneander/genetics'

export type QueensChromosome = Chromosome<number, number>

export type QueensState = {
  boardSize: number
}
