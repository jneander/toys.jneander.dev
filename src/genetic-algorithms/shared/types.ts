import {Chromosome, Fitness, PropagationRecord} from '@jneander/genetics'

export type PropagationTarget<GeneType, FitnessValueType> = {
  chromosome?: Chromosome<GeneType>
  fitness: Fitness<FitnessValueType>
}

export type State<GeneType, FitnessValueType> = {
  [key: string]: unknown
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
