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

  getTimer(): number {
    return this.store.getState().timer
  }

  setTimer(timer: number): void {
    this.store.setState({timer})
  }

  advanceSimulation(): void {
    this.generationSimulation.advanceCreatureSimulation()
    this.setTimer(this.getTimer() + 1)
  }
}
