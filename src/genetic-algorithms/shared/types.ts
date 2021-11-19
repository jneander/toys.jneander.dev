import {Chromosome, PropagationRecord} from '@jneander/genetics'

export type PropagationOptions<GeneType> = {
  mutate: (chromosome: Chromosome<GeneType>) => Chromosome<GeneType>
}

export type State<GeneType, FitnessValueType> = {
  [key: string]: any
  allIterations: boolean
  best: PropagationRecord<GeneType, FitnessValueType> | null
  current: PropagationRecord<GeneType, FitnessValueType> | null
  first: PropagationRecord<GeneType, FitnessValueType> | null
  isRunning: boolean
  iterationCount: number
  playbackPosition: number
  target: PropagationRecord<GeneType, FitnessValueType>
}
