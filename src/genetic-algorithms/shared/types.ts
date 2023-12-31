import {type Chromosome, type Fitness, type PropagationRecord} from '@jneander/genetics'

export type PropagationTarget<GeneType, FitnessValueType> = {
  chromosome?: Chromosome<GeneType>
  fitness: Fitness<FitnessValueType>
}

export type State<GeneType, FitnessValueType> = {
  best: PropagationRecord<GeneType, FitnessValueType> | null
  current: PropagationRecord<GeneType, FitnessValueType> | null
  first: PropagationRecord<GeneType, FitnessValueType> | null
  target: PropagationTarget<GeneType, FitnessValueType> | null
}

export type ControlsState = {
  allIterations: boolean
  isRunning: boolean
  iterationCount: number
  maxPropagationSpeed: boolean
  playbackPosition: number
  propagationSpeed: number
}
