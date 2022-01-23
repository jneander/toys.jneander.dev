import type {Graphics} from 'p5'

import type Creature from '../Creature'
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
import {GenerationSimulation} from '../simulation'
import type {SpeciesCount} from '../types'
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

export class GenerationViewActivity extends Activity {
  pendingGenerationCount: number

  private popupSimulationView: PopupSimulationView
  private createButton: CreateButton
  private stepByStepButton: StepByStepButton
  private quickButton: QuickButton
  private asapButton: AsapButton
  private alapButton: AlapButton
  private generationSlider: GenerationSlider

  private creatureDrawer: CreatureDrawer

  private draggingSlider: boolean
  private generationCountDepictedInGraph: number

  private generationHistoryGraphics: Graphics
  private graphGraphics: Graphics

  constructor(config: ActivityConfig) {
    super(config)

    this.creatureDrawer = new CreatureDrawer({appView: this.appView})

    const widgetConfig = {
      appState: this.appState,
      appView: this.appView
    }

    const simulationWidgetConfig = {
      ...widgetConfig,
      simulationConfig: this.simulationConfig
    }

    this.popupSimulationView = new PopupSimulationView(simulationWidgetConfig)

    this.createButton = new CreateButton({
      ...widgetConfig,

      onClick: () => {
        this.appController.setActivityId(ActivityId.GenerateCreatures)
      }
    })

    this.stepByStepButton = new StepByStepButton({
      ...widgetConfig,

      onClick: () => {
        this.performStepByStepSimulation()
      }
    })

    this.quickButton = new QuickButton({
      ...widgetConfig,

      onClick: () => {
        this.performQuickGenerationSimulation()
      }
    })

    this.asapButton = new AsapButton({
      ...widgetConfig,

      onClick: () => {
        this.performAsapGenerationSimulation()
      }
    })

    this.alapButton = new AlapButton({
      ...widgetConfig,
      activity: this,

      onClick: () => {
        this.startAlapGenerationSimulation()
      }
    })

    this.generationSlider = new GenerationSlider(widgetConfig)

    this.draggingSlider = false
    this.generationCountDepictedInGraph = -1
    this.pendingGenerationCount = 0

    const {canvas} = this.appView

    this.generationHistoryGraphics = canvas.createGraphics(975, 150)
    this.graphGraphics = canvas.createGraphics(975, 570)
  }

  deinitialize(): void {
    this.popupSimulationView.deinitialize()
    this.generationHistoryGraphics.remove()
    this.graphGraphics.remove()
  }

  draw(): void {
    const {appController, appState, appView} = this
    const {canvas, font} = appView

    if (this.draggingSlider && appState.generationCount >= 1) {
      this.generationSlider.onDrag()
    }

    canvas.noStroke()
    canvas.fill(0)
    canvas.background(255, 200, 130)
    canvas.textFont(font, 32)
    canvas.textAlign(canvas.LEFT)
    canvas.textFont(font, 96)
    canvas.text(
      'Generation ' + Math.max(appState.selectedGeneration, 0),
      20,
      100
    )
    canvas.textFont(font, 28)

    if (appState.generationCount == -1) {
      canvas.fill(0)
      canvas.text(
        `Since there are no creatures yet, create ${CREATURE_COUNT} creatures!`,
        20,
        160
      )
      canvas.text(
        'They will be randomly created, and also very simple.',
        20,
        200
      )
      this.createButton.draw()
    } else {
      this.stepByStepButton.draw()
      this.quickButton.draw()
      this.asapButton.draw()
      this.alapButton.draw()

      const fitnessPercentiles = this.getFitnessPercentilesFromHistory(
        appState.selectedGeneration
      )
      const fitnessPercentile =
        Math.round(fitnessPercentiles[FITNESS_PERCENTILE_MEDIAN_INDEX] * 1000) /
        1000

      canvas.fill(0)
      canvas.text('Median ' + FITNESS_LABEL, 50, 160)
      canvas.textAlign(canvas.CENTER)
      canvas.textAlign(canvas.RIGHT)
      canvas.text(fitnessPercentile + ' ' + FITNESS_UNIT_LABEL, 700, 160)

      if (this.generationCountDepictedInGraph !== appState.generationCount) {
        this.drawGraph(975, 570)
        this.generationCountDepictedInGraph = appState.generationCount
      }

      this.drawHistogram(760, 410, 460, 280)
      this.drawGraphImage()

      if (appState.generationCount >= 1) {
        this.generationSlider.draw()
      }

      if (appState.selectedGeneration >= 1) {
        this.drawWorstMedianAndBestCreatures()
      }

      if (
        appState.selectedGeneration > 0 &&
        this.pendingGenerationCount === 0 &&
        !this.draggingSlider
      ) {
        const worstMedianOrBestIndex =
          this.getWorstMedianOrBestIndexUnderCursor()

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
    }

    if (this.pendingGenerationCount > 0) {
      this.pendingGenerationCount--

      if (this.pendingGenerationCount > 0) {
        this.startGenerationSimulation()
      }
    } else {
      appState.generationSimulationMode = GenerationSimulationMode.Off
    }

    if (appState.generationSimulationMode === GenerationSimulationMode.ASAP) {
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
      this.appState.generationCount >= 1 &&
      this.generationSlider.isUnderCursor()
    ) {
      this.draggingSlider = true
    }
  }

  onMouseReleased(): void {
    // When the popup simulation is running, mouse clicks will stop it.
    this.popupSimulationView.dismissSimulationView()

    this.draggingSlider = false

    if (
      this.appState.generationCount === -1 &&
      this.createButton.isUnderCursor()
    ) {
      this.createButton.onClick()
    } else if (this.appState.generationCount >= 0) {
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
  }

  private drawGraph(graphWidth: number, graphHeight: number): void {
    this.generationHistoryGraphics.background(220)
    this.graphGraphics.background(220)

    if (this.appState.generationCount >= 1) {
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
    const {appState, appView} = this
    const {canvas, font} = appView

    canvas.image(this.graphGraphics, 50, 180, 650, 380)
    canvas.image(this.generationHistoryGraphics, 50, 580, 650, 100)

    if (appState.generationCount >= 1) {
      canvas.stroke(0, 160, 0, 255)
      canvas.strokeWeight(3)

      const genWidth = 590.0 / appState.generationCount
      const lineX = 110 + appState.selectedGeneration * genWidth

      canvas.line(lineX, 180, lineX, 500 + 180)

      canvas.textAlign(canvas.LEFT)
      canvas.textFont(font, 12)
      canvas.noStroke()

      const historyEntry =
        appState.generationHistoryMap[appState.selectedGeneration]
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
          canvas.fill(appView.getColor(speciesId, true))
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
    const {appState, appView} = this
    const {canvas, font} = appView

    let maxH = 1

    for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
      if (appState.histogramBarCounts[appState.selectedGeneration][i] > maxH) {
        maxH = appState.histogramBarCounts[appState.selectedGeneration][i]
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

    const fitnessPercentiles = this.getFitnessPercentilesFromHistory(
      appState.selectedGeneration
    )
    const fitnessPercentile =
      fitnessPercentiles[FITNESS_PERCENTILE_MEDIAN_INDEX]

    for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
      const h = Math.min(
        appState.histogramBarCounts[appState.selectedGeneration][i] *
          multiplier,
        hh
      )

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
    const {appState, appView} = this
    const {canvas, font} = appView

    const gh = graphHeight
    const genWidth = graphWidth / appState.generationCount
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

      for (let i = 0; i < appState.generationCount; i++) {
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
    const {appState, appView} = this
    const {canvas} = appView

    this.generationHistoryGraphics.noStroke()
    this.generationHistoryGraphics.colorMode(canvas.HSB, 1)
    this.generationHistoryGraphics.background(0, 0, 0.5)

    const generationWidth = graphWidth / appState.generationCount
    const generationsPerBar = Math.floor(appState.generationCount / 500) + 1

    for (let i1 = 0; i1 < appState.generationCount; i1 += generationsPerBar) {
      const i2 = Math.min(i1 + generationsPerBar, appState.generationCount)

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
        this.generationHistoryGraphics.fill(appView.getColor(speciesId, false))
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

    for (let i = 0; i < this.appState.generationCount; i++) {
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
    return this.appState.generationHistoryMap[generation]?.speciesCounts || []
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
    const {appController, appState} = this

    appState.generationSimulationMode = GenerationSimulationMode.StepByStep
    appController.setActivityId(ActivityId.SimulationRunning)
  }

  private performQuickGenerationSimulation(): void {
    const {appController, appState} = this

    appState.generationSimulationMode = GenerationSimulationMode.Quick
    this.simulateWholeGeneration()
    appController.setActivityId(ActivityId.SimulationFinished)
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
    this.appState.generationSimulationMode = GenerationSimulationMode.ASAP
  }

  private simulateWholeGeneration(): void {
    const generationSimulation = new GenerationSimulation({
      appState: this.appState,
      simulationConfig: this.simulationConfig
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
    const {generationHistoryMap, selectedGeneration} = this.appState

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
    const historyEntry = this.appState.generationHistoryMap[generation]

    if (historyEntry) {
      return historyEntry.fitnessPercentiles
    }

    return new Array(FITNESS_PERCENTILE_CREATURE_INDICES.length).fill(0)
  }
}

class CreateButton extends ButtonWidget {
  draw(): void {
    const {canvas} = this.appView

    canvas.noStroke()
    canvas.fill(100, 200, 100)
    canvas.rect(20, 250, 200, 100)
    canvas.fill(0)
    canvas.text('CREATE', 56, 312)
  }

  isUnderCursor(): boolean {
    return this.appView.rectIsUnderCursor(20, 250, 200, 100)
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
  activity: GenerationViewActivity
}

class AlapButton extends ButtonWidget {
  private activity: GenerationViewActivity

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

class GenerationSlider extends Widget {
  private xPosition: number
  private xPositionMax: number
  private xPositionMin: number
  private xPositionRange: number

  constructor(config: WidgetConfig) {
    super(config)

    this.xPositionMax = 1170
    this.xPositionMin = 760
    this.xPositionRange = this.xPositionMax - this.xPositionMin // 410

    this.xPosition = this.getInitialPosition()
  }

  draw(): void {
    const {canvas, font} = this.appView

    canvas.noStroke()
    canvas.textAlign(canvas.CENTER)
    canvas.fill(100)
    canvas.rect(760, 340, 460, 50)
    canvas.fill(220)
    canvas.rect(this.xPosition, 340, 50, 50)

    let fs = 0
    if (this.appState.selectedGeneration >= 1) {
      fs = Math.floor(Math.log(this.appState.selectedGeneration) / Math.log(10))
    }

    const fontSize = FONT_SIZES[fs]

    canvas.textFont(font, fontSize)
    canvas.fill(0)
    canvas.text(
      this.appState.selectedGeneration,
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

    const {generationCount} = this.appState

    if (generationCount > 1) {
      // After 2 generations, the slider starts at generation 1.
      this.appState.selectedGeneration =
        Math.round(
          ((this.xPosition - this.xPositionMin) * (generationCount - 1)) /
            this.xPositionRange
        ) + 1
    } else {
      this.appState.selectedGeneration = Math.round(
        ((this.xPosition - this.xPositionMin) * generationCount) /
          this.xPositionRange
      )
    }
  }

  updatePosition(): void {
    // Update slider position to reflect change in generation range.

    const {generationCount, selectedGeneration} = this.appState

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

    const {generationCount, selectedGeneration} = this.appState

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
