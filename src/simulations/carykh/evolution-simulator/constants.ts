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
