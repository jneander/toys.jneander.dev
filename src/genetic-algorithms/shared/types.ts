import {Chromosome, Fitness, PropagationRecord} from '@jneander/genetics'

export type PropagationOptions<GeneType> = {
  mutate: (chromosome: Chromosome<GeneType>) => Chromosome<GeneType>
}

export type PropagationTarget<GeneType, FitnessValueType> = {
  chromosome?: Chromosome<GeneType>
  fitness: Fitness<FitnessValueType>
}

export type State<GeneType, FitnessValueType> = {
  [key: string]: any
  allIterations: boolean
  best: PropagationRecord<GeneType, FitnessValueType> | null
  current: PropagationRecord<GeneType, FitnessValueType> | null
  first: PropagationRecord<GeneType, FitnessValueType> | null
  isRunning: boolean
  iterationCount: number
  maxPropagationSpeed: boolean
  playbackPosition: number
  propagationSpeed: number
  target: PropagationTarget<GeneType, FitnessValueType>
}
