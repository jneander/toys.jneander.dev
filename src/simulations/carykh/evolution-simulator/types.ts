import type Creature from './Creature'
import type Muscle from './Muscle'
import type Node from './Node'
import {ActivityInterface} from './activities'
import {ActivityId} from './constants'

export type SimulationCameraState = {
  x: number
  y: number
  zoom: number
}

export type SimulationNodeCache = {
  nextValue: number
  previousPositionX: number
  previousPositionY: number
}

export type SimulationCreatureState = {
  id: number
  muscles: Muscle[]
  nodeCaches: SimulationNodeCache[]
  nodes: Node[]
}

export type SimulationState = {
  creature: SimulationCreatureState
  speed: number
  timer: number
}

export type SpeciesCount = {
  count: number
  speciesId: number
}

export type GenerationHistoryEntry = {
  fastest: Creature
  median: Creature
  slowest: Creature
  fitnessPercentiles: number[]
  histogramBarCounts: number[]
  speciesCounts: SpeciesCount[]
}

export type AppState = {
  creaturesInLatestGeneration: Creature[]
  currentActivity: ActivityInterface
  currentActivityId: ActivityId | null
  generationCount: number
  generationHistoryMap: {[generation: number]: GenerationHistoryEntry}
  nextActivityId: ActivityId
  selectedGeneration: number
}
