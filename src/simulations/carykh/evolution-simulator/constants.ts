export const AIR_FRICTION = 0.95
export const BIG_MUTATION_CHANCE = 0.06
export const CREATURE_COUNT = 1000
export const ENERGY_UNIT = 20
export const FRICTION = 4
export const GRAVITY = 0.005
export const HISTOGRAM_BARS_PER_METER = 5
export const HISTOGRAM_BAR_MIN = -10
export const HISTOGRAM_BAR_MAX = 100
export const HISTOGRAM_BAR_SPAN = HISTOGRAM_BAR_MAX - HISTOGRAM_BAR_MIN
export const NAUSEA_UNIT = 5
export const POST_FONT_SIZE = 0.96
export const PRESSURE_UNIT = 500.0 / 2.37
export const SCALE_TO_FIX_BUG = 1000

export const MAX_MUSCLE_LENGTH_INCLUSIVE = 1.5
export const MIN_MUSCLE_LENGTH_INCLUSIVE = 0.5

export const NODE_MASS_DEFAULT = 0.4

export const FITNESS_PERCENTILE_CREATURE_INDICES = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800,
  900, 910, 920, 930, 940, 950, 960, 970, 980, 990, 999
]

export enum ActivityId {
  Start = 'START',
  GenerationView = 'GENERATION_VIEW',
  GenerateCreatures = 'GENERATE_CREATURES',
  SimulationRunning = 'SIMULATION_RUNNING',
  SimulationFinished = 'SIMULATION_FINISHED',
  SortingCreatures = 'SORTING_CREATURES',
  SortedCreatures = 'SORTED_CREATURES',
  CullingCreatures = 'CULLING_CREATURES',
  CulledCreatures = 'CULLED_CREATURES',
  PropagatingCreatures = 'PROPAGATING_CREATURES',
  PropagatedCreatures = 'PROPAGATED_CREATURES'
}

export enum GenerationSimulationMode {
  Off = 'OFF',
  StepByStep = 'STEP_BY_STEP',
  Quick = 'QUICK',
  ASAP = 'ASAP'
}
