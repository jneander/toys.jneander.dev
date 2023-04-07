import {CREATURE_COUNT, FRAMES_FOR_CREATURE_FITNESS} from '../constants'
import {Creature, averagePositionOfNodes, creatureIdToIndex} from '../creatures'
import type {AppStore, SimulationState} from '../types'
import {CreatureSimulation, SimulationConfig} from './creature-simulation'

export interface GenerationSimulationConfig {
  appStore: AppStore
  simulationConfig: SimulationConfig
}

export class GenerationSimulation {
  private config: GenerationSimulationConfig
  private creatureSimulation: CreatureSimulation

  private creatureQueue: Creature[]

  private creaturesTested: number

  constructor(config: GenerationSimulationConfig) {
    this.config = config

    this.creatureSimulation = new CreatureSimulation(config.simulationConfig)

    this.creatureQueue = []

    this.creaturesTested = 0
  }

  getCreatureSimulation(): CreatureSimulation {
    return this.creatureSimulation
  }

  getCreatureSimulationState(): SimulationState {
    return this.creatureSimulation.getState()
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

    if (this.getCreatureSimulationState().timer === FRAMES_FOR_CREATURE_FITNESS) {
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

  performCreatureSimulation(): void {
    for (let s = 0; s < FRAMES_FOR_CREATURE_FITNESS; s++) {
      this.advanceCreatureSimulation()
    }

    this.advanceGenerationSimulation()
  }

  finishGenerationSimulation(): void {
    const {timer} = this.getCreatureSimulationState()

    for (let frame = timer; frame < FRAMES_FOR_CREATURE_FITNESS; frame++) {
      this.advanceCreatureSimulation()
    }

    this.creaturesTested++

    this.finishGenerationSimulationFromIndex(this.creaturesTested)
  }

  private setCreatureQueue(): void {
    this.creatureQueue = [...this.config.appStore.getState().creaturesInLatestGeneration]

    // Creatures are simulated in id order, ascending.
    this.creatureQueue.sort((creatureA, creatureB) => creatureA.id - creatureB.id)
  }

  private setSimulationState(simulationCreature: Creature): void {
    this.creatureSimulation.setState(simulationCreature)
  }

  private setFitnessOfSimulationCreature(): void {
    const {id, nodes} = this.getCreatureSimulationState().creature
    const {averageX} = averagePositionOfNodes(nodes)
    const index = creatureIdToIndex(id)

    this.creatureQueue[index].fitness = averageX * 0.2 // Multiply by 0.2 because a meter is 5 units for some weird reason.
  }

  private finishGenerationSimulationFromIndex(creatureIndex: number): void {
    for (let i = creatureIndex; i < CREATURE_COUNT; i++) {
      this.setSimulationState(this.creatureQueue[i])

      for (let s = 0; s < FRAMES_FOR_CREATURE_FITNESS; s++) {
        this.advanceCreatureSimulation()
      }
    }
  }
}
