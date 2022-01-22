import Creature from '../Creature'
import {CREATURE_COUNT} from '../constants'
import {averagePositionOfNodes, creatureIdToIndex} from '../helpers'
import {AppState, SimulationState} from '../types'
import {CreatureSimulation, SimulationConfig} from './creature-simulation'

export interface GenerationSimulationConfig {
  appState: AppState
  simulationConfig: SimulationConfig
  simulationState: SimulationState
}

export class GenerationSimulation {
  private config: GenerationSimulationConfig
  private creatureSimulation: CreatureSimulation

  private creaturesTested: number

  constructor(config: GenerationSimulationConfig) {
    this.config = config

    this.creatureSimulation = new CreatureSimulation(
      config.simulationState,
      config.simulationConfig
    )

    this.creaturesTested = 0
  }

  isFinished(): boolean {
    return this.creaturesTested >= CREATURE_COUNT
  }

  initialize(): void {
    const {creaturesInLatestGeneration} = this.config.appState

    this.creaturesTested = 0
    this.setSimulationState(creaturesInLatestGeneration[0])
  }

  advanceCreatureSimulation(): void {
    this.creatureSimulation.advance()
  }

  advanceGenerationSimulation(): void {
    const {creaturesInLatestGeneration} = this.config.appState

    this.creaturesTested++

    if (!this.isFinished()) {
      this.setSimulationState(creaturesInLatestGeneration[this.creaturesTested])
    }
  }

  simulateWholeGeneration(): void {
    this.creaturesTested = 0
    this.finishGenerationSimulationFromIndex(0)
  }

  finishGenerationSimulation(): void {
    const {simulationState} = this.config

    for (let frame = simulationState.timer; frame < 900; frame++) {
      this.advanceCreatureSimulation()
    }

    this.creaturesTested++

    this.finishGenerationSimulationFromIndex(this.creaturesTested)
  }

  setSimulationState(simulationCreature: Creature): void {
    this.creatureSimulation.setState(simulationCreature)
  }

  setFitnessOfSimulationCreature(): void {
    const {appState, simulationState} = this.config

    const {id, nodes} = simulationState.creature
    const {averageX} = averagePositionOfNodes(nodes)
    const index = creatureIdToIndex(id)

    appState.creaturesInLatestGeneration[index].fitness = averageX * 0.2 // Multiply by 0.2 because a meter is 5 units for some weird reason.
  }

  private finishGenerationSimulationFromIndex(creatureIndex: number): void {
    for (let i = creatureIndex; i < CREATURE_COUNT; i++) {
      this.setSimulationState(
        this.config.appState.creaturesInLatestGeneration[i]
      )

      for (let s = 0; s < 900; s++) {
        this.advanceCreatureSimulation()
      }

      this.setFitnessOfSimulationCreature()
    }
  }
}
