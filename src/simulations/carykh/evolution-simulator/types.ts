import type Creature from './Creature'
import type Muscle from './Muscle'
import type Node from './Node'
import {ActivityInterface} from './activities'
import {ActivityId, GenerationSimulationMode} from './constants'

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

export type RandomNumberFn = (
  minInclusive: number,
  maxExclusive: number
) => number

export type SpeciesCount = {
  count: number
  speciesId: number
}

export type GenerationHistoryEntry = {
  fastest: Creature
  median: Creature
  slowest: Creature
}

export type AppState = {
  creatureIdsByGridIndex: number[]
  creaturesInLatestGeneration: Creature[]
  creaturesTested: number
  currentActivity: ActivityInterface
  currentActivityId: ActivityId | null
  fitnessPercentileHistory: Array<number[]>
  generationCount: number
  generationCountDepictedInGraph: number
  generationHistoryMap: {[generation: number]: GenerationHistoryEntry}
  generationSimulationMode: GenerationSimulationMode
  histogramBarCounts: Array<number[]>
  nextActivityId: ActivityId
  pendingGenerationCount: number
  selectedGeneration: number
  showPopupSimulation: boolean
  sortedCreatures: Creature[]
  speciesCountsHistoryMap: {[generation: number]: SpeciesCount[]}
  statusWindow: number
}
