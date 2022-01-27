import type {AppController} from '../../app-controller'
import {GenerationSimulation} from '../../simulation'
import type {AppStore} from '../../types'
import type {ActivityStore} from './types'

export interface ActivityControllerConfig {
  activityStore: ActivityStore
  appController: AppController
  appStore: AppStore
}

export class ActivityController {
  private store: ActivityStore

  private generationSimulation: GenerationSimulation

  constructor(config: ActivityControllerConfig) {
    const {activityStore, appController, appStore} = config

    this.store = activityStore

    this.generationSimulation = new GenerationSimulation({
      appStore,
      simulationConfig: appController.getSimulationConfig()
    })

    this.generationSimulation.initialize()
  }

  getGenerationSimulation(): GenerationSimulation {
    return this.generationSimulation
  }

  getSimulationSpeed(): number {
    return this.generationSimulation.getCreatureSimulation().getState().speed
  }

  setSimulationSpeed(speed: number): void {
    const creatureSimulation = this.generationSimulation.getCreatureSimulation()
    creatureSimulation.setSpeed(speed)
    this.store.setState({simulationSpeed: speed})
  }

  increaseSimulationSpeed(): void {
    let speed = this.getSimulationSpeed()

    speed *= 2

    if (speed === 1024) {
      speed = 900
    }

    if (speed >= 1800) {
      speed = 1
    }

    this.setSimulationSpeed(speed)
  }

  getTimer(): number {
    return this.store.getState().timer
  }

  setTimer(timer: number): void {
    this.store.setState({timer})
  }

  advanceCreatureSimulation(): void {
    this.generationSimulation.advanceCreatureSimulation()
    this.setTimer(this.getTimer() + 1)
  }
}
