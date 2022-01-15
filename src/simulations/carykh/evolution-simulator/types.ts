import type Creature from './Creature'
import type Muscle from './Muscle'
import type Node from './Node'
import {ActivityId, GenerationSimulationMode} from './constants'

export type SimulationConfig = {
  hazelStairs: number
  randomFloatFn: RandomNumberFn
}

export type SimulationCameraState = {
  x: number
  y: number
  zoom: number
}

export type SimulationCreatureState = {
  averageNodeNausea: number
  energyUsed: number
  id: number
  muscles: Muscle[]
  nodes: Node[]
  totalNodeNausea: number
}

export type SimulationState = {
  camera: SimulationCameraState
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
  currentActivityId: ActivityId
  fitnessPercentileHistory: Array<number[]>
  generationCount: number
  generationCountDepictedInGraph: number
  generationHistoryMap: {[generation: number]: GenerationHistoryEntry}
  generationSimulationMode: GenerationSimulationMode
  pendingGenerationCount: number
  popupSimulationCreatureId: number | null
  selectedGeneration: number
  showPopupSimulation: boolean
  sortedCreatures: Creature[]
  speciesCountsHistoryMap: {[generation: number]: SpeciesCount[]}
  statusWindow: number
  viewTimer: number
}
