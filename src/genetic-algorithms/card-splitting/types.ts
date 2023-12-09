import type {Chromosome} from '@jneander/genetics'

export type CardSplittingFitnessValue = {
  difference: number
  duplicates: number
}

export type CardSplittingChromosome = Chromosome<string>
