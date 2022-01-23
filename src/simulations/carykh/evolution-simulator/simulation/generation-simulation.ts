import type Creature from '../Creature'
import {CREATURE_COUNT} from '../constants'
import {averagePositionOfNodes, creatureIdToIndex} from '../helpers'
import type {AppState, SimulationState} from '../types'
import {CreatureSimulation, SimulationConfig} from './creature-simulation'

export interface GenerationSimulationConfig {
  appState: AppState
  simulationConfig: SimulationConfig
  simulationState: SimulationState
}

export class GenerationSimulation {
  private config: GenerationSimulationConfig
  private creatureSimulation: CreatureSimulation

  private creatureQueue: Creature[]

  private creaturesTested: number

  constructor(config: GenerationSimulationConfig) {
    this.config = config

    this.creatureSimulation = new CreatureSimulation(
      config.simulationState,
      config.simulationConfig
    )

    this.creatureQueue = []

    this.creaturesTested = 0
  }

  isFinished(): boolean {
    return this.creaturesTested >= CREATURE_COUNT
  }

  initialize(): void {
    this.creaturesTested = 0
    this.setCreatureQueue()
    this.setSimulationState(this.creatureQueue[0])
  }

  advanceCreatureSimulation(): void {
    this.creatureSimulation.advance()

    if (this.config.simulationState.timer === 900) {
      this.setFitnessOfSimulationCreature()
    }
  }

  advanceGenerationSimulation(): void {
    this.creaturesTested++

    if (!this.isFinished()) {
      this.setSimulationState(this.creatureQueue[this.creaturesTested])
    }
  }

  simulateWholeGeneration(): void {
    this.creaturesTested = 0
    this.setCreatureQueue()
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

  private setCreatureQueue(): void {
    this.creatureQueue = [...this.config.appState.creaturesInLatestGeneration]

    // Creatures are simulated in id order, ascending.
    this.creatureQueue.sort(
      (creatureA, creatureB) => creatureA.id - creatureB.id
    )
  }

  private setSimulationState(simulationCreature: Creature): void {
    this.creatureSimulation.setState(simulationCreature)
  }

  private setFitnessOfSimulationCreature(): void {
    const {id, nodes} = this.config.simulationState.creature
    const {averageX} = averagePositionOfNodes(nodes)
    const index = creatureIdToIndex(id)

    this.creatureQueue[index].fitness = averageX * 0.2 // Multiply by 0.2 because a meter is 5 units for some weird reason.
  }

  private finishGenerationSimulationFromIndex(creatureIndex: number): void {
    for (let i = creatureIndex; i < CREATURE_COUNT; i++) {
      this.setSimulationState(this.creatureQueue[i])

      for (let s = 0; s < 900; s++) {
        this.advanceCreatureSimulation()
      }
    }
  }
}
