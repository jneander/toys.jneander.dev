import type {AppController} from '../../app-controller'
import {ActivityId} from '../../constants'
import {GenerationSimulation} from '../../simulation'
import type {AppStore} from '../../types'
import {GenerationSimulationMode} from './constants'
import type {ActivityStore} from './types'

export interface ActivityControllerConfig {
  activityStore: ActivityStore
  appController: AppController
  appStore: AppStore
}

export class ActivityController {
  private activityStore: ActivityStore
  private appController: AppController
  private appStore: AppStore

  constructor(config: ActivityControllerConfig) {
    const {activityStore, appController, appStore} = config

    this.activityStore = activityStore
    this.appController = appController
    this.appStore = appStore
  }

  performStepByStepSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.StepByStep,
      pendingGenerationCount: 0
    })
    this.appController.setActivityId(ActivityId.SimulationRunning)
  }

  performQuickGenerationSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.Quick,
      pendingGenerationCount: 0
    })
    this.simulateWholeGeneration()
    this.appController.setActivityId(ActivityId.SimulationFinished)
  }

  performAsapGenerationSimulation(): void {
    this.activityStore.setState({pendingGenerationCount: 1})
    this.startGenerationSimulation()
  }

  startAlapGenerationSimulation(): void {
    this.activityStore.setState({pendingGenerationCount: 1000000000})
    this.startGenerationSimulation()
  }

  startGenerationSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.ASAP
    })
  }

  simulateWholeGeneration(): void {
    const generationSimulation = new GenerationSimulation({
      appStore: this.appStore,
      simulationConfig: this.appController.getSimulationConfig()
    })

    generationSimulation.simulateWholeGeneration()
  }
}
