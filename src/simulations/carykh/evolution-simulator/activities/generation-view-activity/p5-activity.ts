import {P5Activity, P5ActivityConfig} from '../shared'
import type {ActivityController} from './activity-controller'
import {GenerationSimulationMode} from './constants'
import type {ActivityStore} from './types'

export interface GenerationViewActivityConfig extends P5ActivityConfig {
  activityController: ActivityController
  activityStore: ActivityStore
}

export class GenerationViewP5Activity extends P5Activity {
  private activityController: ActivityController
  private activityStore: ActivityStore

  constructor(config: GenerationViewActivityConfig) {
    super(config)

    this.activityController = config.activityController
    this.activityStore = config.activityStore
  }

  draw(): void {
    const {appController, activityController, activityStore, p5Wrapper} = this
    const {canvas} = p5Wrapper

    canvas.background(255, 200, 130)

    const {pendingGenerationCount} = activityStore.getState()

    if (activityStore.getState().pendingGenerationCount > 0) {
      activityStore.setState({
        pendingGenerationCount: pendingGenerationCount - 1
      })

      if (pendingGenerationCount - 1 > 0) {
        this.startGenerationSimulation()
      }
    } else {
      activityStore.setState({
        generationSimulationMode: GenerationSimulationMode.Off
      })
    }

    const {generationSimulationMode} = activityStore.getState()

    if (generationSimulationMode === GenerationSimulationMode.ASAP) {
      activityController.simulateWholeGeneration()
      appController.sortCreatures()
      appController.updateHistory()
      appController.cullCreatures()
      appController.propagateCreatures()
    }
  }

  onMousePressed(): void {
    this.activityStore.setState({pendingGenerationCount: 0})
  }

  private startGenerationSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.ASAP
    })
  }
}
