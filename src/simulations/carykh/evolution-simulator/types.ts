import type Muscle from './Muscle'
import type Node from './Node'

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
