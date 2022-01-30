import {
  FITNESS_LABEL,
  FITNESS_PERCENTILE_MEDIAN_INDEX,
  FITNESS_UNIT_LABEL
} from '../../constants'
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
    const {activityController, appController, appStore, p5Wrapper} = this
    const {canvas, font} = p5Wrapper

    const {selectedGeneration} = appStore.getState()

    canvas.noStroke()
    canvas.fill(0)
    canvas.background(255, 200, 130)
    canvas.textFont(font, 32)
    canvas.textAlign(canvas.LEFT)
    canvas.textFont(font, 96)
    canvas.text('Generation ' + Math.max(selectedGeneration, 0), 20, 100)
    canvas.textFont(font, 28)

    const fitnessPercentiles =
      activityController.getFitnessPercentilesFromHistory(selectedGeneration)
    const fitnessPercentile =
      Math.round(fitnessPercentiles[FITNESS_PERCENTILE_MEDIAN_INDEX] * 1000) /
      1000

    canvas.fill(0)
    canvas.text('Median ' + FITNESS_LABEL, 50, 160)
    canvas.textAlign(canvas.CENTER)
    canvas.textAlign(canvas.RIGHT)
    canvas.text(fitnessPercentile + ' ' + FITNESS_UNIT_LABEL, 700, 160)

    const {pendingGenerationCount} = this.activityStore.getState()

    if (this.activityStore.getState().pendingGenerationCount > 0) {
      this.activityStore.setState({
        pendingGenerationCount: pendingGenerationCount - 1
      })

      if (pendingGenerationCount - 1 > 0) {
        this.startGenerationSimulation()
      }
    } else {
      this.activityStore.setState({
        generationSimulationMode: GenerationSimulationMode.Off
      })
    }

    const {generationSimulationMode} = this.activityStore.getState()

    if (generationSimulationMode === GenerationSimulationMode.ASAP) {
      this.activityController.simulateWholeGeneration()
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
