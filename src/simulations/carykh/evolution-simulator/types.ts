import type {Store} from '@jneander/utils-state'

import type Muscle from './Muscle'
import type Node from './Node'
import {ActivityId} from './constants'
import type {Creature} from './creatures'

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
  currentActivityId: ActivityId
  generationCount: number
  generationHistoryMap: {[generation: number]: GenerationHistoryEntry}
  selectedGeneration: number
}

export type AppStore = Store<AppState>
