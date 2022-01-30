import type {Graphics} from 'p5'

import {
  CREATURE_COUNT,
  FITNESS_LABEL,
  FITNESS_PERCENTILE_MEDIAN_INDEX,
  FITNESS_UNIT_LABEL,
  HISTOGRAM_BARS_PER_METER,
  HISTOGRAM_BAR_MAX,
  HISTOGRAM_BAR_MIN,
  HISTOGRAM_BAR_SPAN
} from '../../constants'
import {getSpeciesColor} from '../../p5-utils'
import type {SpeciesCount} from '../../types'
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

  private generationCountDepictedInGraph: number

  private generationHistoryGraphics: Graphics

  constructor(config: GenerationViewActivityConfig) {
    super(config)

    this.activityController = config.activityController
    this.activityStore = config.activityStore

    this.generationCountDepictedInGraph = -1

    const {canvas} = this.p5Wrapper

    this.generationHistoryGraphics = canvas.createGraphics(975, 150)
  }

  draw(): void {
    const {activityController, appController, appStore, p5Wrapper} = this
    const {canvas, font} = p5Wrapper

    const {generationCount} = appStore.getState()

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

    if (this.generationCountDepictedInGraph !== generationCount) {
      this.drawGraph(975)
      this.generationCountDepictedInGraph = generationCount
    }

    this.drawHistogram(760, 410, 460, 280)
    this.drawGraphImage()

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

  private drawGraph(graphWidth: number): void {
    this.generationHistoryGraphics.background(220)

    if (this.appStore.getState().generationCount >= 1) {
      this.drawSegBars(90, 0, graphWidth - 90, 150)
    }
  }

  private drawGraphImage(): void {
    const {appStore, p5Wrapper} = this
    const {canvas, font} = p5Wrapper

    const {generationCount, generationHistoryMap, selectedGeneration} =
      appStore.getState()

    canvas.image(this.generationHistoryGraphics, 50, 580, 650, 100)

    if (generationCount >= 1) {
      canvas.stroke(0, 160, 0, 255)
      canvas.strokeWeight(3)

      const genWidth = 590.0 / generationCount
      const lineX = 110 + selectedGeneration * genWidth

      canvas.line(lineX, 180, lineX, 500 + 180)

      canvas.textAlign(canvas.LEFT)
      canvas.textFont(font, 12)
      canvas.noStroke()

      const historyEntry = generationHistoryMap[selectedGeneration]
      const speciesCounts = historyEntry?.speciesCounts || []

      // Identify the largest species count.
      const highCount = speciesCounts.reduce(
        (max, entry) => Math.max(max, entry.count),
        0
      )

      const minCountToBeLabeled = 25
      const yOffset = 573

      let cumulativeStart = 0

      speciesCounts.forEach(({speciesId, count}) => {
        if (count >= minCountToBeLabeled) {
          // When this species has a count of at least 25, label it on the graph.

          // Set the starting y position for this species' label.
          const y = Math.floor(
            ((cumulativeStart + count / 2) / CREATURE_COUNT) * 100 + yOffset
          )

          if (count === highCount) {
            /*
             * When the count for this species matches the largest count, add
             * emphasis to its style.
             */

            canvas.stroke(0)
            canvas.strokeWeight(2)
          } else {
            canvas.noStroke()
          }

          canvas.fill(255, 255, 255)
          canvas.rect(lineX + 3, y, 56, 14)
          canvas.colorMode(canvas.HSB, 1.0)
          canvas.fill(getSpeciesColor(canvas, speciesId, true))
          // Example label: "S45: 207"
          canvas.text(`S${speciesId}: ${count}`, lineX + 5, y + 11)
          canvas.colorMode(canvas.RGB, 255)
        }

        cumulativeStart += count
      })

      canvas.noStroke()
    }
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

  private drawSegBars(
    x: number,
    y: number,
    graphWidth: number,
    graphHeight: number
  ): void {
    const {appStore, p5Wrapper} = this
    const {canvas} = p5Wrapper

    const {generationCount} = appStore.getState()

    this.generationHistoryGraphics.noStroke()
    this.generationHistoryGraphics.colorMode(canvas.HSB, 1)
    this.generationHistoryGraphics.background(0, 0, 0.5)

    const generationWidth = graphWidth / generationCount
    const generationsPerBar = Math.floor(generationCount / 500) + 1

    for (let i1 = 0; i1 < generationCount; i1 += generationsPerBar) {
      const i2 = Math.min(i1 + generationsPerBar, generationCount)

      const barX1 = x + i1 * generationWidth
      const barX2 = x + i2 * generationWidth

      /*
       * The initial index `i1` of `0` does not correspond to a generation, so
       * fall back to an empty species counts history entry.
       */
      const speciesCounts1 = this.getSpeciesCountsForGeneration(i1)
      const speciesCounts2 = this.getSpeciesCountsForGeneration(i2)

      /*
       * Joined entries will include a count for all species represented between
       * both generations, using a count of `0` where a species has no count in
       * the given generation.
       */
      const joinedEntries = []

      let countIndex1 = 0
      let countIndex2 = 0

      while (
        countIndex1 < speciesCounts1.length ||
        countIndex2 < speciesCounts2.length
      ) {
        const entry1 = speciesCounts1[countIndex1]
        const entry2 = speciesCounts2[countIndex2]

        if (entry1?.speciesId === entry2?.speciesId) {
          joinedEntries.push({
            speciesId: entry1.speciesId,
            countStart: entry1.count,
            countEnd: entry2.count
          })

          countIndex1++
          countIndex2++
        } else if (entry2 == null || entry1?.speciesId < entry2.speciesId) {
          joinedEntries.push({
            speciesId: entry1.speciesId,
            countStart: entry1.count,
            countEnd: 0
          })

          countIndex1++
        } else {
          joinedEntries.push({
            speciesId: entry2.speciesId,
            countStart: 0,
            countEnd: entry2.count
          })

          countIndex2++
        }
      }

      let cumulativeStart = 0
      let cumulativeEnd = 0

      if (speciesCounts1.length === 0) {
        // Start all graph areas from the middle of the range.
        cumulativeStart = Math.floor(CREATURE_COUNT / 2)
      }

      joinedEntries.forEach(({speciesId, countStart, countEnd}) => {
        this.generationHistoryGraphics.fill(
          getSpeciesColor(canvas, speciesId, false)
        )
        this.generationHistoryGraphics.beginShape()

        // top-left and top-right
        const start1 = cumulativeStart / CREATURE_COUNT
        const end1 = cumulativeEnd / CREATURE_COUNT

        // Accumulate the counts for the next species' offset.
        cumulativeStart += countStart
        cumulativeEnd += countEnd

        // bottom-left and bottom-right
        const start2 = cumulativeStart / CREATURE_COUNT
        const end2 = cumulativeEnd / CREATURE_COUNT

        // Draw quadrilateral, counter-clockwise.
        this.generationHistoryGraphics.vertex(barX1, y + start1 * graphHeight)
        this.generationHistoryGraphics.vertex(barX1, y + start2 * graphHeight)
        this.generationHistoryGraphics.vertex(barX2, y + end2 * graphHeight)
        this.generationHistoryGraphics.vertex(barX2, y + end1 * graphHeight)

        this.generationHistoryGraphics.endShape()
      })
    }

    canvas.colorMode(canvas.RGB, 255)
  }

  private getSpeciesCountsForGeneration(generation: number): SpeciesCount[] {
    return (
      this.appStore.getState().generationHistoryMap[generation]
        ?.speciesCounts || []
    )
  }

  private startGenerationSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.ASAP
    })
  }
}
