import {Chromosome} from '@jneander/genetics'

export type PropagationOptions<GeneType, FitnessValueType> = {
  mutate: (
    parent: Chromosome<GeneType, FitnessValueType>,
    iterationCount: number
  ) => Chromosome<GeneType, FitnessValueType>
}

export type State<GeneType, FitnessValueType> = {
  [key: string]: any
  allIterations: boolean
  best: Chromosome<GeneType, FitnessValueType> | null
  current: Chromosome<GeneType, FitnessValueType> | null
  first: Chromosome<GeneType, FitnessValueType> | null
  isRunning: boolean
  iterationCount: number
  playbackPosition: number
  target: Chromosome<GeneType, FitnessValueType> | null
}
