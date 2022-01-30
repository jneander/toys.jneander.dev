import {
  FITNESS_LABEL,
  FITNESS_PERCENTILE_MEDIAN_INDEX,
  FITNESS_UNIT_LABEL,
  HISTOGRAM_BARS_PER_METER,
  HISTOGRAM_BAR_MAX,
  HISTOGRAM_BAR_MIN,
  HISTOGRAM_BAR_SPAN
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

    this.drawHistogram(760, 410, 460, 280)

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

  private drawHistogram(x: number, y: number, hw: number, hh: number): void {
    const {activityController, appStore, p5Wrapper} = this
    const {canvas, font} = p5Wrapper

    const {selectedGeneration} = appStore.getState()

    let maxH = 1

    for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
      const histogramBarCounts =
        activityController.getHistogramBarCountsFromHistory(selectedGeneration)

      if (histogramBarCounts[i] > maxH) {
        maxH = histogramBarCounts[i]
      }
    }

    canvas.fill(200)
    canvas.noStroke()
    canvas.rect(x, y, hw, hh)
    canvas.fill(0, 0, 0)

    const barW = hw / HISTOGRAM_BAR_SPAN
    const multiplier = (hh / maxH) * 0.9

    canvas.textAlign(canvas.LEFT)
    canvas.textFont(font, 16)
    canvas.stroke(128)
    canvas.strokeWeight(2)

    let unit = 100

    if (maxH < 300) {
      unit = 50
    }

    if (maxH < 100) {
      unit = 20
    }

    if (maxH < 50) {
      unit = 10
    }

    for (let i = 0; i < hh / multiplier; i += unit) {
      let theY = y + hh - i * multiplier

      canvas.line(x, theY, x + hw, theY)

      if (i == 0) {
        theY -= 5
      }

      canvas.text(i, x + hw + 5, theY + 7)
    }

    canvas.textAlign(canvas.CENTER)

    for (let i = HISTOGRAM_BAR_MIN; i <= HISTOGRAM_BAR_MAX; i += 10) {
      if (i == 0) {
        canvas.stroke(0, 0, 255)
      } else {
        canvas.stroke(128)
      }

      const theX = x + (i - HISTOGRAM_BAR_MIN) * barW

      canvas.text(
        canvas.nf(i / HISTOGRAM_BARS_PER_METER, 0, 1),
        theX,
        y + hh + 14
      )
      canvas.line(theX, y, theX, y + hh)
    }

    canvas.noStroke()

    const fitnessPercentiles =
      activityController.getFitnessPercentilesFromHistory(selectedGeneration)
    const fitnessPercentile =
      fitnessPercentiles[FITNESS_PERCENTILE_MEDIAN_INDEX]

    for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
      const histogramBarCounts =
        activityController.getHistogramBarCountsFromHistory(selectedGeneration)
      const h = Math.min(histogramBarCounts[i] * multiplier, hh)

      if (
        i + HISTOGRAM_BAR_MIN ==
        Math.floor(fitnessPercentile * HISTOGRAM_BARS_PER_METER)
      ) {
        canvas.fill(255, 0, 0)
      } else {
        canvas.fill(0, 0, 0)
      }

      canvas.rect(x + i * barW, y + hh - h, barW, h)
    }
  }

  private startGenerationSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.ASAP
    })
  }
}
