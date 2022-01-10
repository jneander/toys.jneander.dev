export const AIR_FRICTION = 0.95
export const BIG_MUTATION_CHANCE = 0.06
export const ENERGY_UNIT = 20
export const FRICTION = 4
export const GRAVITY = 0.005
export const NAUSEA_UNIT = 5
export const PRESSURE_UNIT = 500.0 / 2.37

export const MAX_MUSCLE_LENGTH_INCLUSIVE = 1.5
export const MIN_MUSCLE_LENGTH_INCLUSIVE = 0.5

export const NODE_MASS_DEFAULT = 0.4

export enum Activity {
  Start = 'START',
  GenerationView = 'GENERATION_VIEW',
  GeneratingCreatures = 'GENERATING_CREATURES',
  GeneratedCreatures = 'GENERATED_CREATURES',
  RequestingSimulation = 'REQUESTING_SIMULATION',
  SimulationRunning = 'SIMULATION_RUNNING',
  SimulationFinished = 'SIMULATION_FINISHED',
  FinishedStepByStep = 'FINISHED_STEP_BY_STEP',
  SortingCreatures = 'SORTING_CREATURES',
  SortedCreatures = 'SORTED_CREATURES',
  CullingCreatures = 'CULLING_CREATURES',
  CulledCreatures = 'CULLED_CREATURES',
  PropagatingCreatures = 'PROPAGATING_CREATURES',
  PropagatedCreatures = 'PROPAGATED_CREATURES'
}
