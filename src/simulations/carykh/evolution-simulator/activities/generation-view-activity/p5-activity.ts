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

  private drawHistogram(
    histogramStartX: number,
    histogramStartY: number,
    histogramWidth: number,
    histogramHeight: number
  ): void {
    const {activityController, appStore, p5Wrapper} = this
    const {canvas, font} = p5Wrapper

    const {selectedGeneration} = appStore.getState()

    const histogramBarCounts =
      activityController.getHistogramBarCountsFromHistory(selectedGeneration)

    const largestCount = Math.max(...histogramBarCounts)

    // Draw background.
    canvas.fill(200)
    canvas.noStroke()
    canvas.rect(
      histogramStartX,
      histogramStartY,
      histogramWidth,
      histogramHeight
    )

    const barWidth = histogramWidth / HISTOGRAM_BAR_SPAN
    const verticalScaleToFit = 0.9
    const barHeightMultiplier =
      (histogramHeight / largestCount) * verticalScaleToFit

    canvas.fill(0, 0, 0)
    canvas.textAlign(canvas.LEFT)
    canvas.textFont(font, 16)
    canvas.stroke(128)
    canvas.strokeWeight(2)

    let unit = 100

    if (largestCount < 300) {
      unit = 50
    }

    if (largestCount < 100) {
      unit = 20
    }

    if (largestCount < 50) {
      unit = 10
    }

    // Draw horizontal ticks and labels.
    for (let i = 0; i < histogramHeight / barHeightMultiplier; i += unit) {
      let theY = histogramStartY + histogramHeight - i * barHeightMultiplier

      canvas.line(histogramStartX, theY, histogramStartX + histogramWidth, theY)

      if (i == 0) {
        theY -= 5
      }

      canvas.text(i, histogramStartX + histogramWidth + 5, theY + 7)
    }

    canvas.textAlign(canvas.CENTER)

    // Draw vertical ticks and labels.
    for (let i = HISTOGRAM_BAR_MIN; i <= HISTOGRAM_BAR_MAX; i += 10) {
      if (i == 0) {
        canvas.stroke(0, 0, 255)
      } else {
        canvas.stroke(128)
      }

      const theX = histogramStartX + (i - HISTOGRAM_BAR_MIN) * barWidth

      canvas.text(
        canvas.nf(i / HISTOGRAM_BARS_PER_METER, 0, 1),
        theX,
        histogramStartY + histogramHeight + 14
      )
      canvas.line(
        theX,
        histogramStartY,
        theX,
        histogramStartY + histogramHeight
      )
    }

    canvas.noStroke()

    const fitnessPercentiles =
      activityController.getFitnessPercentilesFromHistory(selectedGeneration)
    const fitnessPercentile =
      fitnessPercentiles[FITNESS_PERCENTILE_MEDIAN_INDEX]

    // Draw bars.
    // SPAN == 110
    // i => [0, 1, 2, ..., 109]
    for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
      const barHeight = Math.min(
        histogramBarCounts[i] * barHeightMultiplier,
        histogramHeight
      )

      if (
        i + HISTOGRAM_BAR_MIN ==
        Math.floor(fitnessPercentile * HISTOGRAM_BARS_PER_METER)
      ) {
        canvas.fill(255, 0, 0)
      } else {
        canvas.fill(0, 0, 0)
      }

      canvas.rect(
        histogramStartX + i * barWidth,
        histogramStartY + histogramHeight - barHeight,
        barWidth,
        barHeight
      )
    }
  }

  private startGenerationSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.ASAP
    })
  }
}
