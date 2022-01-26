import type {Graphics} from 'p5'
import {useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type Creature from '../Creature'
import type {AppController} from '../app-controller'
import {
  ActivityId,
  CREATURE_COUNT,
  FITNESS_LABEL,
  FITNESS_PERCENTILE_CREATURE_INDICES,
  FITNESS_PERCENTILE_LOWEST_INDEX,
  FITNESS_PERCENTILE_MEDIAN_INDEX,
  FITNESS_UNIT_LABEL,
  GenerationSimulationMode,
  HISTOGRAM_BARS_PER_METER,
  HISTOGRAM_BAR_MAX,
  HISTOGRAM_BAR_MIN,
  HISTOGRAM_BAR_SPAN,
  SCALE_TO_FIX_BUG
} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import {toInt} from '../math'
import {getSpeciesColor} from '../p5-utils'
import {GenerationSimulation} from '../simulation'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore, SpeciesCount} from '../types'
import {
  ButtonWidget,
  ButtonWidgetConfig,
  PopupSimulationView,
  PopupSimulationViewAnchor,
  Widget,
  WidgetConfig
} from '../views'
import {Activity, ActivityConfig} from './shared'

const FONT_SIZES = [50, 36, 25, 20, 16, 14, 11, 9]

const CREATURE_TILE_HEIGHT = 140
const CREATURE_TILE_WIDTH = 140
const CREATURE_TILES_START_X = 760
const CREATURE_TILES_START_Y = 180
const CREATURE_TILES_GAP = 20

export interface GenerationViewActivityProps {
  appController: AppController
  appStore: AppStore
}

export function GenerationViewActivity(props: GenerationViewActivityProps) {
  const {appController, appStore} = props

  const sketchFn = useMemo(() => {
    function createActivityFn({appView}: CreateActivityFnParameters) {
      return new GenerationViewP5Activity({appController, appStore, appView})
    }

    return createSketchFn({createActivityFn})
  }, [appController, appStore])

  return <P5ClientView sketch={sketchFn} />
}

class GenerationViewP5Activity extends Activity {
  pendingGenerationCount: number

  private popupSimulationView: PopupSimulationView
  private stepByStepButton: StepByStepButton
  private quickButton: QuickButton
  private asapButton: AsapButton
  private alapButton: AlapButton
  private generationSlider: GenerationSlider

  private creatureDrawer: CreatureDrawer

  private draggingSlider: boolean
  private generationCountDepictedInGraph: number
  private generationSimulationMode: GenerationSimulationMode

  private generationHistoryGraphics: Graphics
  private graphGraphics: Graphics

  constructor(config: ActivityConfig) {
    super(config)

    this.creatureDrawer = new CreatureDrawer({appView: this.appView})

    const simulationWidgetConfig = {
      appView: this.appView,
      simulationConfig: this.appController.getSimulationConfig()
    }

    this.popupSimulationView = new PopupSimulationView(simulationWidgetConfig)

    this.stepByStepButton = new StepByStepButton({
      appView: this.appView,

      onClick: () => {
        this.performStepByStepSimulation()
      }
    })

    this.quickButton = new QuickButton({
      appView: this.appView,

      onClick: () => {
        this.performQuickGenerationSimulation()
      }
    })

    this.asapButton = new AsapButton({
      appView: this.appView,

      onClick: () => {
        this.performAsapGenerationSimulation()
      }
    })

    this.alapButton = new AlapButton({
      activity: this,
      appView: this.appView,

      onClick: () => {
        this.startAlapGenerationSimulation()
      }
    })

    this.generationSlider = new GenerationSlider({
      appStore: this.appStore,
      appView: this.appView
    })

    this.draggingSlider = false
    this.generationCountDepictedInGraph = -1
    this.pendingGenerationCount = 0
    this.generationSimulationMode = GenerationSimulationMode.Off

    const {canvas} = this.appView

    this.generationHistoryGraphics = canvas.createGraphics(975, 150)
    this.graphGraphics = canvas.createGraphics(975, 570)
  }

  draw(): void {
    const {appController, appStore, appView} = this
    const {canvas, font} = appView

    const {generationCount} = appStore.getState()

    if (this.draggingSlider && generationCount >= 1) {
      this.generationSlider.onDrag()
    }

    const {selectedGeneration} = appStore.getState()

    canvas.noStroke()
    canvas.fill(0)
    canvas.background(255, 200, 130)
    canvas.textFont(font, 32)
    canvas.textAlign(canvas.LEFT)
    canvas.textFont(font, 96)
    canvas.text('Generation ' + Math.max(selectedGeneration, 0), 20, 100)
    canvas.textFont(font, 28)

    this.stepByStepButton.draw()
    this.quickButton.draw()
    this.asapButton.draw()
    this.alapButton.draw()

    const fitnessPercentiles =
      this.getFitnessPercentilesFromHistory(selectedGeneration)
    const fitnessPercentile =
      Math.round(fitnessPercentiles[FITNESS_PERCENTILE_MEDIAN_INDEX] * 1000) /
      1000

    canvas.fill(0)
    canvas.text('Median ' + FITNESS_LABEL, 50, 160)
    canvas.textAlign(canvas.CENTER)
    canvas.textAlign(canvas.RIGHT)
    canvas.text(fitnessPercentile + ' ' + FITNESS_UNIT_LABEL, 700, 160)

    if (this.generationCountDepictedInGraph !== generationCount) {
      this.drawGraph(975, 570)
      this.generationCountDepictedInGraph = generationCount
    }

    this.drawHistogram(760, 410, 460, 280)
    this.drawGraphImage()

    if (generationCount >= 1) {
      this.generationSlider.draw()
    }

    if (selectedGeneration >= 1) {
      this.drawWorstMedianAndBestCreatures()
    }

    if (
      selectedGeneration > 0 &&
      this.pendingGenerationCount === 0 &&
      !this.draggingSlider
    ) {
      const worstMedianOrBestIndex = this.getWorstMedianOrBestIndexUnderCursor()

      /*
       * When the cursor is over the worst, median, or best creature, the popup
       * simulation will be displayed for that creature.
       */

      if (worstMedianOrBestIndex != null) {
        this.configurePopupSimulation(worstMedianOrBestIndex)
        this.drawWorstMedianAndBestHoverState(worstMedianOrBestIndex)
        this.popupSimulationView.draw()
      } else {
        this.clearPopupSimulation()
      }
    } else {
      this.clearPopupSimulation()
    }

    if (this.pendingGenerationCount > 0) {
      this.pendingGenerationCount--

      if (this.pendingGenerationCount > 0) {
        this.startGenerationSimulation()
      }
    } else {
      this.generationSimulationMode = GenerationSimulationMode.Off
    }

    if (this.generationSimulationMode === GenerationSimulationMode.ASAP) {
      this.simulateWholeGeneration()
      appController.sortCreatures()
      appController.updateHistory()
      appController.cullCreatures()
      appController.propagateCreatures()

      this.generationSlider.updatePosition()
    }
  }

  onMousePressed(): void {
    this.pendingGenerationCount = 0

    if (
      this.appStore.getState().generationCount >= 1 &&
      this.generationSlider.isUnderCursor()
    ) {
      this.draggingSlider = true
    }
  }

  onMouseReleased(): void {
    // When the popup simulation is running, mouse clicks will stop it.
    this.popupSimulationView.dismissSimulationView()

    this.draggingSlider = false

    if (this.stepByStepButton.isUnderCursor()) {
      this.stepByStepButton.onClick()
    } else if (this.quickButton.isUnderCursor()) {
      this.quickButton.onClick()
    } else if (this.asapButton.isUnderCursor()) {
      this.asapButton.onClick()
    } else if (this.alapButton.isUnderCursor()) {
      this.alapButton.onClick()
    }
  }

  private drawGraph(graphWidth: number, graphHeight: number): void {
    this.generationHistoryGraphics.background(220)
    this.graphGraphics.background(220)

    if (this.appStore.getState().generationCount >= 1) {
      this.drawLines(
        90,
        toInt(graphHeight * 0.05),
        graphWidth - 90,
        toInt(graphHeight * 0.9)
      )
      this.drawSegBars(90, 0, graphWidth - 90, 150)
    }
  }

  private drawGraphImage(): void {
    const {appStore, appView} = this
    const {canvas, font} = appView

    const {generationCount, generationHistoryMap, selectedGeneration} =
      appStore.getState()

    canvas.image(this.graphGraphics, 50, 180, 650, 380)
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
    const {appStore, appView} = this
    const {canvas, font} = appView

    const {selectedGeneration} = appStore.getState()

    let maxH = 1

    for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
      const histogramBarCounts =
        this.getHistogramBarCountsFromHistory(selectedGeneration)

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
      this.getFitnessPercentilesFromHistory(selectedGeneration)
    const fitnessPercentile =
      fitnessPercentiles[FITNESS_PERCENTILE_MEDIAN_INDEX]

    for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
      const histogramBarCounts =
        this.getHistogramBarCountsFromHistory(selectedGeneration)
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

  private drawLines(
    x: number,
    y: number,
    graphWidth: number,
    graphHeight: number
  ): void {
    const {appStore, appView} = this
    const {canvas, font} = appView

    const {generationCount} = appStore.getState()

    const gh = graphHeight
    const genWidth = graphWidth / generationCount
    const best = this.extreme(1)
    const worst = this.extreme(-1)
    const meterHeight = graphHeight / (best - worst)
    const zero = (best / (best - worst)) * gh
    const unit = this.setUnit(best, worst)

    this.graphGraphics.stroke(150)
    this.graphGraphics.strokeWeight(2)
    this.graphGraphics.fill(150)
    this.graphGraphics.textFont(font, 18)
    this.graphGraphics.textAlign(canvas.RIGHT)

    for (
      let i = Math.ceil((worst - (best - worst) / 18.0) / unit) * unit;
      i < best + (best - worst) / 18.0;
      i += unit
    ) {
      const lineY = y - i * meterHeight + zero
      this.graphGraphics.line(x, lineY, graphWidth + x, lineY)
      this.graphGraphics.text(
        this.showUnit(i, unit) + ' ' + FITNESS_UNIT_LABEL,
        x - 5,
        lineY + 4
      )
    }

    this.graphGraphics.stroke(0)

    for (let i = 0; i < FITNESS_PERCENTILE_CREATURE_INDICES.length; i++) {
      let k

      if (i == FITNESS_PERCENTILE_LOWEST_INDEX) {
        k = FITNESS_PERCENTILE_MEDIAN_INDEX
      } else if (i < FITNESS_PERCENTILE_MEDIAN_INDEX) {
        k = i
      } else {
        k = i + 1
      }

      if (k == FITNESS_PERCENTILE_MEDIAN_INDEX) {
        this.graphGraphics.stroke(255, 0, 0, 255)
        this.graphGraphics.strokeWeight(5)
      } else {
        canvas.stroke(0)

        if (
          k == 0 ||
          k == FITNESS_PERCENTILE_LOWEST_INDEX ||
          (k >= 10 && k <= 18)
        ) {
          this.graphGraphics.strokeWeight(3)
        } else {
          this.graphGraphics.strokeWeight(1)
        }
      }

      for (let i = 0; i < generationCount; i++) {
        const fitnessPercentiles = this.getFitnessPercentilesFromHistory(i)
        const currentPercentile = fitnessPercentiles[k]

        const nextPercentiles = this.getFitnessPercentilesFromHistory(i + 1)
        const nextPercentile = nextPercentiles[k]

        this.graphGraphics.line(
          x + i * genWidth,
          -currentPercentile * meterHeight + zero + y,
          x + (i + 1) * genWidth,
          -nextPercentile * meterHeight + zero + y
        )
      }
    }
  }

  private drawSegBars(
    x: number,
    y: number,
    graphWidth: number,
    graphHeight: number
  ): void {
    const {appStore, appView} = this
    const {canvas} = appView

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

  private drawWorstMedianAndBestCreatures(): void {
    const {canvas, font} = this.appView

    canvas.noStroke()
    canvas.textAlign(canvas.CENTER)

    // i = worstMedianOrBestIndex
    for (let i = 0; i < 3; i++) {
      const xOffset = i * (CREATURE_TILE_WIDTH + CREATURE_TILES_GAP)

      canvas.fill(220)
      canvas.rect(
        CREATURE_TILES_START_X + xOffset,
        CREATURE_TILES_START_Y,
        CREATURE_TILE_WIDTH,
        CREATURE_TILE_HEIGHT
      )

      canvas.push()

      // Translate to center bottom of where creature will be drawn.
      canvas.translate(
        CREATURE_TILES_START_X + xOffset + CREATURE_TILE_WIDTH / 2,
        290
      )
      canvas.scale(60.0 / SCALE_TO_FIX_BUG)

      const creature = this.getWorstMedianOrBestCreatureFromHistory(i)

      this.creatureDrawer.drawCreature(creature, 0, 0, canvas)

      canvas.pop()
    }

    canvas.fill(0)
    canvas.textFont(font, 16)
    canvas.text('Worst Creature', 830, 310)
    canvas.text('Median Creature', 990, 310)
    canvas.text('Best Creature', 1150, 310)
  }

  private drawWorstMedianAndBestHoverState(
    worstMedianOrBestIndex: number
  ): void {
    const {canvas} = this.appView

    canvas.push()

    canvas.stroke(Math.abs((canvas.frameCount % 30) - 15) * 17) // oscillate between 0–255
    canvas.strokeWeight(3)
    canvas.noFill()

    const xOffset =
      worstMedianOrBestIndex * (CREATURE_TILE_WIDTH + CREATURE_TILES_GAP)

    canvas.rect(
      CREATURE_TILES_START_X + xOffset,
      CREATURE_TILES_START_Y,
      CREATURE_TILE_WIDTH,
      CREATURE_TILE_HEIGHT
    )

    canvas.pop()
  }

  private extreme(sign: number): number {
    let record = -sign

    for (let i = 0; i < this.appStore.getState().generationCount; i++) {
      const fitnessPercentiles = this.getFitnessPercentilesFromHistory(i + 1)
      const toTest =
        fitnessPercentiles[
          toInt(
            FITNESS_PERCENTILE_MEDIAN_INDEX -
              sign * FITNESS_PERCENTILE_MEDIAN_INDEX
          )
        ]

      if (toTest * sign > record * sign) {
        record = toTest
      }
    }

    return record
  }

  private getSpeciesCountsForGeneration(generation: number): SpeciesCount[] {
    return (
      this.appStore.getState().generationHistoryMap[generation]
        ?.speciesCounts || []
    )
  }

  private getWorstMedianOrBestIndexUnderCursor(): number | null {
    const {cursorX, cursorY} = this.appView.getCursorPosition()

    if (
      cursorY < CREATURE_TILES_START_Y ||
      cursorY >= CREATURE_TILES_START_Y + CREATURE_TILE_HEIGHT
    ) {
      return null
    }

    // i = worstMedianOrBestIndex
    for (let i = 0; i < 3; i++) {
      const xOffset = i * (CREATURE_TILE_WIDTH + CREATURE_TILES_GAP)
      let tileStartX = CREATURE_TILES_START_X + xOffset

      if (cursorX >= tileStartX && cursorX < tileStartX + CREATURE_TILE_WIDTH) {
        return i
      }
    }

    return null
  }

  private performStepByStepSimulation(): void {
    this.generationSimulationMode = GenerationSimulationMode.StepByStep
    this.appController.setActivityId(ActivityId.SimulationRunning)
  }

  private performQuickGenerationSimulation(): void {
    this.generationSimulationMode = GenerationSimulationMode.Quick
    this.simulateWholeGeneration()
    this.appController.setActivityId(ActivityId.SimulationFinished)
  }

  private performAsapGenerationSimulation(): void {
    this.pendingGenerationCount = 1
    this.startGenerationSimulation()
  }

  private startAlapGenerationSimulation(): void {
    this.pendingGenerationCount = 1000000000
    this.startGenerationSimulation()
  }

  private startGenerationSimulation(): void {
    this.generationSimulationMode = GenerationSimulationMode.ASAP
  }

  private simulateWholeGeneration(): void {
    const generationSimulation = new GenerationSimulation({
      appStore: this.appStore,
      simulationConfig: this.appController.getSimulationConfig()
    })

    generationSimulation.simulateWholeGeneration()
  }

  private setUnit(best: number, worst: number): number {
    const unit2 = (3 * Math.log(best - worst)) / Math.log(10) - 2

    if ((unit2 + 90) % 3 < 1) {
      return Math.pow(10, Math.floor(unit2 / 3))
    }

    if ((unit2 + 90) % 3 < 2) {
      return Math.pow(10, Math.floor((unit2 - 1) / 3)) * 2
    }

    return Math.pow(10, Math.floor((unit2 - 2) / 3)) * 5
  }

  private showUnit(i: number, unit: number): String {
    if (unit < 1) {
      return this.appView.canvas.nf(i, 0, 2) + ''
    }

    return toInt(i) + ''
  }

  private configurePopupSimulation(worstMedianOrBestIndex: number): void {
    const creature = this.getWorstMedianOrBestCreatureFromHistory(
      worstMedianOrBestIndex
    )

    const ranks = [CREATURE_COUNT, Math.floor(CREATURE_COUNT / 2), 1]
    const rank = ranks[worstMedianOrBestIndex]

    if (this.pendingGenerationCount === 0) {
      // The full simulation is not running, so the popup simulation can be shown.
      this.popupSimulationView.setCreatureInfo({creature, rank})

      const anchor = this.calculateAnchorForPopupSimulation(
        worstMedianOrBestIndex
      )
      this.popupSimulationView.setAnchor(anchor)
    }
  }

  private clearPopupSimulation(): void {
    this.popupSimulationView.setCreatureInfo(null)
  }

  private calculateAnchorForPopupSimulation(
    worstMedianOrBestIndex: number
  ): PopupSimulationViewAnchor {
    const xOffset =
      worstMedianOrBestIndex * (CREATURE_TILE_WIDTH + CREATURE_TILES_GAP)

    const positionX = CREATURE_TILES_START_X + xOffset - 60 // 60 == half the info box width
    const positionY = CREATURE_TILES_START_Y

    return {
      startPositionX: positionX,
      startPositionY: positionY,
      endPositionX: positionX,
      endPositionY: positionY,
      margin: 0
    }
  }

  private getWorstMedianOrBestCreatureFromHistory(
    worstMedianOrBestIndex: number
  ): Creature {
    const {generationHistoryMap, selectedGeneration} = this.appStore.getState()

    const historyEntry = generationHistoryMap[selectedGeneration]

    if (worstMedianOrBestIndex === 0) {
      return historyEntry.slowest
    }

    if (worstMedianOrBestIndex === 1) {
      return historyEntry.median
    }

    return historyEntry.fastest
  }

  private getFitnessPercentilesFromHistory(generation: number): number[] {
    const historyEntry =
      this.appStore.getState().generationHistoryMap[generation]

    if (historyEntry) {
      return historyEntry.fitnessPercentiles
    }

    return new Array(FITNESS_PERCENTILE_CREATURE_INDICES.length).fill(0)
  }

  private getHistogramBarCountsFromHistory(generation: number): number[] {
    const historyEntry =
      this.appStore.getState().generationHistoryMap[generation]

    if (historyEntry) {
      return historyEntry.histogramBarCounts
    }

    return new Array(HISTOGRAM_BAR_SPAN).fill(0)
  }
}

class StepByStepButton extends ButtonWidget {
  draw(): void {
    const {canvas} = this.appView

    canvas.noStroke()
    canvas.fill(100, 200, 100)
    canvas.rect(760, 20, 460, 40)
    canvas.fill(0)
    canvas.text('Do 1 step-by-step generation.', 770, 50)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(760, 20, 460, 40)
  }
}

class QuickButton extends ButtonWidget {
  draw(): void {
    const {canvas} = this.appView

    canvas.noStroke()
    canvas.fill(100, 200, 100)
    canvas.rect(760, 70, 460, 40)
    canvas.fill(0)
    canvas.text('Do 1 quick generation.', 770, 100)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(760, 70, 460, 40)
  }
}

class AsapButton extends ButtonWidget {
  draw(): void {
    const {canvas} = this.appView

    canvas.noStroke()
    canvas.fill(100, 200, 100)
    canvas.rect(760, 120, 230, 40)
    canvas.fill(0)
    canvas.text('Do 1 gen ASAP.', 770, 150)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(760, 120, 230, 40)
  }
}

interface AlapButtonConfig extends ButtonWidgetConfig {
  activity: GenerationViewP5Activity
}

class AlapButton extends ButtonWidget {
  private activity: GenerationViewP5Activity

  constructor(config: AlapButtonConfig) {
    super(config)

    this.activity = config.activity
  }

  draw(): void {
    const {canvas} = this.appView

    canvas.noStroke()

    if (this.activity.pendingGenerationCount > 1) {
      canvas.fill(128, 255, 128)
    } else {
      canvas.fill(70, 140, 70)
    }

    canvas.rect(990, 120, 230, 40)
    canvas.fill(0)
    canvas.text('Do gens ALAP.', 1000, 150)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(990, 120, 230, 40)
  }
}

interface GenerationSliderConfig extends WidgetConfig {
  appStore: AppStore
}

class GenerationSlider extends Widget {
  private appStore: AppStore

  private xPosition: number
  private xPositionMax: number
  private xPositionMin: number
  private xPositionRange: number

  constructor(config: GenerationSliderConfig) {
    super(config)

    this.appStore = config.appStore

    this.xPositionMax = 1170
    this.xPositionMin = 760
    this.xPositionRange = this.xPositionMax - this.xPositionMin // 410

    this.xPosition = this.getInitialPosition()
  }

  draw(): void {
    const {canvas, font} = this.appView

    const {selectedGeneration} = this.appStore.getState()

    canvas.noStroke()
    canvas.textAlign(canvas.CENTER)
    canvas.fill(100)
    canvas.rect(760, 340, 460, 50)
    canvas.fill(220)
    canvas.rect(this.xPosition, 340, 50, 50)

    let fs = 0
    if (selectedGeneration >= 1) {
      fs = Math.floor(Math.log(selectedGeneration) / Math.log(10))
    }

    const fontSize = FONT_SIZES[fs]

    canvas.textFont(font, fontSize)
    canvas.fill(0)
    canvas.text(
      selectedGeneration,
      this.xPosition + 25,
      366 + fontSize * 0.3333
    )
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(this.xPosition, 340, 50, 50)
  }

  onDrag(): void {
    const {cursorX} = this.appView.getCursorPosition()

    /*
     * Update the slider position with a sluggish effect. This avoids some
     * perceived jitter in the control resulting from the frame rate.
     */

    this.xPosition = Math.min(
      Math.max(
        this.xPosition + (cursorX - 25 - this.xPosition) * 0.5,
        this.xPositionMin
      ),
      this.xPositionMax
    )

    const {generationCount} = this.appStore.getState()

    let selectedGeneration

    if (generationCount > 1) {
      // After 2 generations, the slider starts at generation 1.
      selectedGeneration =
        Math.round(
          ((this.xPosition - this.xPositionMin) * (generationCount - 1)) /
            this.xPositionRange
        ) + 1
    } else {
      selectedGeneration = Math.round(
        ((this.xPosition - this.xPositionMin) * generationCount) /
          this.xPositionRange
      )
    }

    this.appStore.setState({selectedGeneration})
  }

  updatePosition(): void {
    // Update slider position to reflect change in generation range.

    const {generationCount, selectedGeneration} = this.appStore.getState()

    if (selectedGeneration === generationCount) {
      // When selecting the latest generation, push the slider to max.
      this.xPosition = this.xPositionMax
      return
    }

    // Preserve previously-selected generation by shifting slider.
    let previousGenerationRange = generationCount - 1
    if (previousGenerationRange > 1) {
      previousGenerationRange--
    }

    let currentGenerationRange = generationCount
    if (generationCount > 1) {
      // After 2 generations, the slider starts at generation 1.
      currentGenerationRange--
    }

    let sliderPercentage =
      (this.xPosition - this.xPositionMin) / this.xPositionRange
    sliderPercentage *= previousGenerationRange / currentGenerationRange

    this.xPosition = Math.round(
      sliderPercentage * this.xPositionRange + this.xPositionMin
    )
  }

  private getInitialPosition(): number {
    // Get initial slider position based on app state.

    const {generationCount, selectedGeneration} = this.appStore.getState()

    if (selectedGeneration === generationCount) {
      // When selecting the latest generation, push the slider to max.
      return this.xPositionMax
    }

    let sliderPercentage = 1
    if (generationCount > 1) {
      // After 2 generations, the slider starts at generation 1.
      sliderPercentage = (selectedGeneration - 1) / (generationCount - 1)
    }

    return Math.round(
      sliderPercentage * this.xPositionRange + this.xPositionMin
    )
  }
}
