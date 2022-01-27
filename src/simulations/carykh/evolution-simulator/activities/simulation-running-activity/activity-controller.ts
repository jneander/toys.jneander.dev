import type {AppController} from '../../app-controller'
import {GenerationSimulation} from '../../simulation'
import type {AppStore} from '../../types'
import type {ActivityState} from './types'

export interface ActivityControllerConfig {
  appController: AppController
  appStore: AppStore
}

export class ActivityController {
  private state: ActivityState

  private generationSimulation: GenerationSimulation

  constructor(config: ActivityControllerConfig) {
    const {appController, appStore} = config

    this.generationSimulation = new GenerationSimulation({
      appStore,
      simulationConfig: appController.getSimulationConfig()
    })

    this.generationSimulation.initialize()

    this.state = {
      timer: 0
    }
  }

  getGenerationSimulation(): GenerationSimulation {
    return this.generationSimulation
  }

  getTimer(): number {
    return this.state.timer
  }

  setTimer(timer: number): void {
    this.state.timer = timer
  }
}
