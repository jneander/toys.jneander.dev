import type p5 from 'p5'
import type {Font, Graphics} from 'p5'

import Creature from './Creature'
import Simulation from './Simulation'
import {Activity, NullActivity} from './activities'
import {AppController} from './app-controller'
import {
  ActivityId,
  CREATURE_COUNT,
  FITNESS_PERCENTILE_CREATURE_INDICES,
  GenerationSimulationMode,
  HISTOGRAM_BARS_PER_METER,
  HISTOGRAM_BAR_MAX,
  HISTOGRAM_BAR_MIN,
  HISTOGRAM_BAR_SPAN,
  POST_FONT_SIZE,
  SCALE_TO_FIX_BUG
} from './constants'
import {CreatureDrawer} from './creature-drawer'
import {
  averagePositionOfNodes,
  creatureIdToIndex,
  historyEntryKeyForStatusWindow
} from './helpers'
import {toInt} from './math'
import type {AppState, SimulationConfig, SimulationState} from './types'
import {AppView} from './views'

export default function sketch(p5: p5) {
  const FITNESS_LABEL = 'Distance'
  const FITNESS_UNIT_LABEL = 'm'
  const FONT_SIZES = [50, 36, 25, 20, 16, 14, 11, 9]
  const FRAME_RATE = 60 // target frames per second
  const SEED = 0

  let font: Font
  let graphImage: Graphics
  let popUpImage: Graphics
  let segBarImage: Graphics

  const appState: AppState = {
    creatureIdsByGridIndex: new Array<number>(CREATURE_COUNT),
    creaturesInLatestGeneration: new Array<Creature>(CREATURE_COUNT),
    creaturesTested: 0,
    currentActivity: new NullActivity(),
    currentActivityId: null,
    fitnessPercentileHistory: [],
    generationCount: -1,
    generationCountDepictedInGraph: -1,
    generationHistoryMap: {},
    generationSimulationMode: GenerationSimulationMode.Off,
    histogramBarCounts: [],
    nextActivityId: ActivityId.Start,
    pendingGenerationCount: 0,
    popupSimulationCreatureId: null,
    selectedGeneration: 0,
    showPopupSimulation: false,
    sortedCreatures: [],
    speciesCountsHistoryMap: {},
    statusWindow: -4,
    viewTimer: 0
  }

  const simulationConfig: SimulationConfig = {
    hazelStairs: -1,
    randomFloatFn: (minInclusive: number, maxExclusive: number) =>
      p5.random(minInclusive, maxExclusive)
  }

  const simulationState: SimulationState = {
    camera: {
      x: 0,
      y: 0,
      zoom: 0.015
    },

    creature: {
      averageNodeNausea: 0,
      energyUsed: 0,
      id: 0,
      muscles: [],
      nodes: [],
      totalNodeNausea: 0
    },

    speed: 1,
    timer: 0
  }

  const simulation = new Simulation(simulationState, simulationConfig)

  const appController = new AppController({
    appState,
    randomFractFn: (minInclusive: number, maxExclusive: number) =>
      p5.random(minInclusive, maxExclusive),
    simulation,
    simulationState
  })

  let appView: AppView

  let creatureDrawer: CreatureDrawer

  abstract class Widget {
    abstract draw(): void
  }

  class StartViewStartButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(appView.width / 2 - 200, 300, 400, 200)
      p5.fill(0)
      p5.text('START', appView.width / 2, 430)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(appView.width / 2 - 200, 300, 400, 200)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.GenerationView)
    }
  }

  class GenerationViewCreateButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(20, 250, 200, 100)
      p5.fill(0)
      p5.text('CREATE', 56, 312)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(20, 250, 200, 100)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.GenerateCreatures)
    }
  }

  class GeneratedCreaturesBackButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 100, 200)
      p5.rect(900, 664, 260, 40)
      p5.fill(0)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 24)
      p5.text('Back', appView.width - 250, 690)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      appState.generationCount = 0
      appController.setActivityId(ActivityId.GenerationView)
    }
  }

  class SimulateStepByStepButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(760, 20, 460, 40)
      p5.fill(0)
      p5.text('Do 1 step-by-step generation.', 770, 50)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(760, 20, 460, 40)
    }

    onClick(): void {
      appController.performStepByStepSimulation()
    }
  }

  class SimulateQuickButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(760, 70, 460, 40)
      p5.fill(0)
      p5.text('Do 1 quick generation.', 770, 100)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(760, 70, 460, 40)
    }

    onClick(): void {
      appController.performQuickGenerationSimulation()
    }
  }

  class SimulateAsapButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(760, 120, 230, 40)
      p5.fill(0)
      p5.text('Do 1 gen ASAP.', 770, 150)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(760, 120, 230, 40)
    }

    onClick(): void {
      appState.pendingGenerationCount = 1
      appController.startASAP()
    }
  }

  class SimulateAlapButton extends Widget {
    draw(): void {
      p5.noStroke()

      if (appState.pendingGenerationCount >= 2) {
        p5.fill(128, 255, 128)
      } else {
        p5.fill(70, 140, 70)
      }

      p5.rect(990, 120, 230, 40)
      p5.fill(0)
      p5.text('Do gens ALAP.', 1000, 150)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(990, 120, 230, 40)
    }

    onClick(): void {
      appState.pendingGenerationCount = 1000000000
      appController.startASAP()
    }
  }

  class StepByStepSkipButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(0, appView.height - 40, 90, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('SKIP', 45, appView.height - 8)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(0, appView.height - 40, 90, 40)
    }

    onClick(): void {
      for (let s = appState.viewTimer; s < 900; s++) {
        appController.advanceSimulation()
      }

      appState.viewTimer = 1021
    }
  }

  class StepByStepPlaybackSpeedButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(120, appView.height - 40, 240, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('PB speed: x' + simulationState.speed, 240, appView.height - 8)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(120, appView.height - 40, 240, 40)
    }

    onClick(): void {
      simulationState.speed *= 2

      if (simulationState.speed === 1024) {
        simulationState.speed = 900
      }

      if (simulationState.speed >= 1800) {
        simulationState.speed = 1
      }
    }
  }

  class StepByStepFinishButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(appView.width - 120, appView.height - 40, 120, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('FINISH', appView.width - 60, appView.height - 8)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(
        appView.width - 120,
        appView.height - 40,
        120,
        40
      )
    }

    onClick(): void {
      appController.finishGenerationSimulation()
    }
  }

  class SortCreaturesButton extends Widget {
    draw(): void {
      appView.screenGraphics.noStroke()
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.rect(900, 664, 260, 40)
      appView.screenGraphics.fill(0)
      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.text('Sort', appView.width - 250, 690)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.SortingCreatures)
    }
  }

  class SortingCreaturesSkipButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(0, appView.height - 40, 90, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('SKIP', 45, appView.height - 8)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(0, appView.height - 40, 90, 40)
    }

    onClick(): void {
      appState.viewTimer = 100000
    }
  }

  class CullCreaturesButton extends Widget {
    draw(): void {
      appView.screenGraphics.noStroke()
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.rect(900, 670, 260, 40)
      appView.screenGraphics.fill(0)
      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.text(
        `Kill ${Math.floor(CREATURE_COUNT / 2)}`,
        appView.width - 250,
        700
      )
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(900, 670, 260, 40)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.CullCreatures)
    }
  }

  class PropagateCreaturesButton extends Widget {
    draw(): void {
      appView.screenGraphics.noStroke()
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.rect(1050, 670, 160, 40)
      appView.screenGraphics.fill(0)
      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.text('Reproduce', appView.width - 150, 700)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.PropagateCreatures)
    }
  }

  class PropagatedCreaturesBackButton extends Widget {
    draw(): void {
      appView.screenGraphics.noStroke()
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.rect(1050, 670, 160, 40)
      appView.screenGraphics.fill(0)
      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.text('Back', appView.width - 150, 700)
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      appController.setActivityId(ActivityId.GenerationView)
    }
  }

  class GenerationSlider extends Widget {
    private xPosition: number
    private xPositionMax: number
    private xPositionMin: number
    private xPositionRange: number

    constructor() {
      super()

      this.xPositionMax = 1170
      this.xPositionMin = 760
      this.xPositionRange = this.xPositionMax - this.xPositionMin // 410

      this.xPosition = this.getInitialPosition()
    }

    draw(): void {
      p5.noStroke()
      p5.textAlign(p5.CENTER)
      p5.fill(100)
      p5.rect(760, 340, 460, 50)
      p5.fill(220)
      p5.rect(this.xPosition, 340, 50, 50)

      let fs = 0
      if (appState.selectedGeneration >= 1) {
        fs = Math.floor(Math.log(appState.selectedGeneration) / Math.log(10))
      }

      const fontSize = FONT_SIZES[fs]

      p5.textFont(font, fontSize)
      p5.fill(0)
      p5.text(
        appState.selectedGeneration,
        this.xPosition + 25,
        366 + fontSize * 0.3333
      )
    }

    isUnderCursor(): boolean {
      return appView.rectIsUnderCursor(this.xPosition, 340, 50, 50)
    }

    onDrag(): void {
      const {cursorX} = appView.getCursorPosition()

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

      const {generationCount} = appState

      if (generationCount > 1) {
        // After 2 generations, the slider starts at generation 1.
        appState.selectedGeneration =
          Math.round(
            ((this.xPosition - this.xPositionMin) * (generationCount - 1)) /
              this.xPositionRange
          ) + 1
      } else {
        appState.selectedGeneration = Math.round(
          ((this.xPosition - this.xPositionMin) * generationCount) /
            this.xPositionRange
        )
      }
    }

    updatePosition(): void {
      // Update slider position to reflect change in generation range.

      const {generationCount, selectedGeneration} = appState

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

      const {generationCount, selectedGeneration} = appState

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

  class StatusWindowView extends Widget {
    draw(): void {
      let x, y, px, py
      let rank = appState.statusWindow + 1

      let creature

      p5.stroke(Math.abs((p5.frameCount % 30) - 15) * 17) // oscillate between 0–255
      p5.strokeWeight(3)
      p5.noFill()

      if (appState.statusWindow >= 0) {
        creature = appState.sortedCreatures[appState.statusWindow]

        if (appState.currentActivityId === ActivityId.SimulationFinished) {
          const id = creatureIdToIndex(creature.id)
          x = id % 40
          y = Math.floor(id / 40)
        } else {
          x = appState.statusWindow % 40
          y = Math.floor(appState.statusWindow / 40) + 1
        }

        px = x * 30 + 55
        py = y * 25 + 10

        if (px <= 1140) {
          px += 80
        } else {
          px -= 80
        }

        p5.rect(x * 30 + 40, y * 25 + 17, 30, 25)
      } else {
        const historyEntry =
          appState.generationHistoryMap[appState.selectedGeneration]
        creature =
          historyEntry[historyEntryKeyForStatusWindow(appState.statusWindow)]

        x = 760 + (appState.statusWindow + 3) * 160
        y = 180
        px = x
        py = y
        p5.rect(x, y, 140, 140)

        const ranks = [CREATURE_COUNT, Math.floor(CREATURE_COUNT / 2), 1]
        rank = ranks[appState.statusWindow + 3]
      }

      p5.noStroke()
      p5.fill(255)
      p5.rect(px - 60, py, 120, 52)
      p5.fill(0)
      p5.textFont(font, 12)
      p5.textAlign(p5.CENTER)
      p5.text('#' + rank, px, py + 12)
      p5.text('ID: ' + creature.id, px, py + 24)
      p5.text('Fitness: ' + p5.nf(creature.fitness, 0, 3), px, py + 36)
      p5.colorMode(p5.HSB, 1)

      const sp =
        (creature.nodes.length % 10) * 10 + (creature.muscles.length % 10)
      p5.fill(appView.getColor(sp, true))
      p5.text(
        'Species: S' +
          (creature.nodes.length % 10) +
          '' +
          (creature.muscles.length % 10),
        px,
        py + 48
      )
      p5.colorMode(p5.RGB, 255)

      if (appState.showPopupSimulation) {
        this.drawPopupSimulation(px, py)
      }
    }

    private drawPopupSimulation(px: number, py: number): void {
      let py2 = py - 125
      if (py >= 360) {
        py2 -= 180
      } else {
        py2 += 180
      }

      const px2 = Math.min(Math.max(px - 90, 10), 970)

      simulationState.camera.zoom = 0.009

      const {averageX, averageY} = averagePositionOfNodes(
        simulationState.creature.nodes
      )
      simulationState.camera.x += (averageX - simulationState.camera.x) * 0.1
      simulationState.camera.y += (averageY - simulationState.camera.y) * 0.1

      popUpImage.push()
      popUpImage.translate(225, 225)
      popUpImage.scale(1.0 / simulationState.camera.zoom / SCALE_TO_FIX_BUG)
      popUpImage.translate(
        -simulationState.camera.x * SCALE_TO_FIX_BUG,
        -simulationState.camera.y * SCALE_TO_FIX_BUG
      )

      if (simulationState.timer < 900) {
        popUpImage.background(120, 200, 255)
      } else {
        popUpImage.background(60, 100, 128)
      }

      drawPosts(2)
      drawGround(600, 600, popUpImage)

      creatureDrawer.drawCreaturePieces(
        simulationState.creature.nodes,
        simulationState.creature.muscles,
        0,
        0,
        popUpImage
      )

      popUpImage.noStroke()
      popUpImage.pop()

      p5.image(popUpImage, px2, py2, 300, 300)

      drawStats(px2 + 295, py2, 0.45)
      appController.advanceSimulation()
    }
  }

  const statusWindowView = new StatusWindowView()

  class StartActivity extends Activity {
    private startButton: StartViewStartButton

    constructor() {
      super()

      this.startButton = new StartViewStartButton()
    }

    initialize(): void {
      p5.background(255)
      p5.noStroke()
      p5.fill(0)
      p5.text('EVOLUTION!', appView.width / 2, 200)
      this.startButton.draw()
    }

    onMouseReleased(): void {
      if (this.startButton.isUnderCursor()) {
        this.startButton.onClick()
      }
    }
  }

  class GenerationViewActivity extends Activity {
    private createButton: GenerationViewCreateButton
    private stepByStepButton: SimulateStepByStepButton
    private quickButton: SimulateQuickButton
    private asapButton: SimulateAsapButton
    private alapButton: SimulateAlapButton
    private generationSlider: GenerationSlider

    private draggingSlider: boolean

    constructor() {
      super()

      this.createButton = new GenerationViewCreateButton()
      this.stepByStepButton = new SimulateStepByStepButton()
      this.quickButton = new SimulateQuickButton()
      this.asapButton = new SimulateAsapButton()
      this.alapButton = new SimulateAlapButton()
      this.generationSlider = new GenerationSlider()

      this.draggingSlider = false
    }

    draw(): void {
      if (this.draggingSlider && appState.generationCount >= 1) {
        this.generationSlider.onDrag()
      }

      p5.noStroke()
      p5.fill(0)
      p5.background(255, 200, 130)
      p5.textFont(font, 32)
      p5.textAlign(p5.LEFT)
      p5.textFont(font, 96)
      p5.text('Generation ' + Math.max(appState.selectedGeneration, 0), 20, 100)
      p5.textFont(font, 28)

      if (appState.generationCount == -1) {
        p5.fill(0)
        p5.text(
          `Since there are no creatures yet, create ${CREATURE_COUNT} creatures!`,
          20,
          160
        )
        p5.text('They will be randomly created, and also very simple.', 20, 200)
        this.createButton.draw()
      } else {
        this.stepByStepButton.draw()
        this.quickButton.draw()
        this.asapButton.draw()
        this.alapButton.draw()

        p5.fill(0)
        p5.text('Median ' + FITNESS_LABEL, 50, 160)
        p5.textAlign(p5.CENTER)
        p5.textAlign(p5.RIGHT)
        p5.text(
          Math.round(
            appState.fitnessPercentileHistory[
              Math.min(
                appState.selectedGeneration,
                appState.fitnessPercentileHistory.length - 1
              )
            ][14] * 1000
          ) /
            1000 +
            ' ' +
            FITNESS_UNIT_LABEL,
          700,
          160
        )

        if (
          appState.generationCountDepictedInGraph !== appState.generationCount
        ) {
          this.drawGraph(975, 570)
          appState.generationCountDepictedInGraph = appState.generationCount
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
          appState.pendingGenerationCount === 0 &&
          !this.draggingSlider
        ) {
          const {cursorX, cursorY} = appView.getCursorPosition()

          /*
           * When the cursor is over the worst, median, or best creature, the popup
           * simulation will be displayed for that creature.
           */

          let worstMedianOrBest: number | null = null

          if (Math.abs(cursorY - 250) <= 70) {
            if (Math.abs(cursorX - 990) <= 230) {
              const modX = (cursorX - 760) % 160

              if (modX < 140) {
                worstMedianOrBest = Math.floor((cursorX - 760) / 160) - 3
              }
            }
          }

          if (worstMedianOrBest != null) {
            appController.setPopupSimulationCreatureId(worstMedianOrBest)
            statusWindowView.draw()
          } else {
            appController.clearPopupSimulation()
          }
        } else {
          appController.clearPopupSimulation()
        }
      }

      if (appState.pendingGenerationCount > 0) {
        appState.pendingGenerationCount--

        if (appState.pendingGenerationCount > 0) {
          appController.startASAP()
        }
      } else {
        appState.generationSimulationMode = GenerationSimulationMode.Off
      }

      if (appState.generationSimulationMode === GenerationSimulationMode.ASAP) {
        appController.setSimulationState(
          appState.creaturesInLatestGeneration[appState.creaturesTested]
        )
        appController.finishGenerationSimulationFromIndex(0)
        appController.sortCreatures()
        appController.updateHistory()
        appController.cullCreatures()
        appController.propagateCreatures()

        this.generationSlider.updatePosition()
      }
    }

    onMousePressed(): void {
      if (
        appState.generationCount >= 1 &&
        this.generationSlider.isUnderCursor()
      ) {
        this.draggingSlider = true
      }
    }

    onMouseReleased(): void {
      this.draggingSlider = false

      if (
        appState.generationCount === -1 &&
        this.createButton.isUnderCursor()
      ) {
        this.createButton.onClick()
      } else if (appState.generationCount >= 0) {
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
      graphImage.background(220)

      if (appState.generationCount >= 1) {
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
      p5.image(graphImage, 50, 180, 650, 380)
      p5.image(segBarImage, 50, 580, 650, 100)

      if (appState.generationCount >= 1) {
        p5.stroke(0, 160, 0, 255)
        p5.strokeWeight(3)

        const genWidth = 590.0 / appState.generationCount
        const lineX = 110 + appState.selectedGeneration * genWidth

        p5.line(lineX, 180, lineX, 500 + 180)

        p5.textAlign(p5.LEFT)
        p5.textFont(font, 12)
        p5.noStroke()

        const speciesCounts =
          appState.speciesCountsHistoryMap[appState.selectedGeneration] || []

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

              p5.stroke(0)
              p5.strokeWeight(2)
            } else {
              p5.noStroke()
            }

            p5.fill(255, 255, 255)
            p5.rect(lineX + 3, y, 56, 14)
            p5.colorMode(p5.HSB, 1.0)
            p5.fill(appView.getColor(speciesId, true))
            // Example label: "S45: 207"
            p5.text(`S${speciesId}: ${count}`, lineX + 5, y + 11)
            p5.colorMode(p5.RGB, 255)
          }

          cumulativeStart += count
        })

        p5.noStroke()
      }
    }

    private drawHistogram(x: number, y: number, hw: number, hh: number): void {
      let maxH = 1

      for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
        if (
          appState.histogramBarCounts[appState.selectedGeneration][i] > maxH
        ) {
          maxH = appState.histogramBarCounts[appState.selectedGeneration][i]
        }
      }

      p5.fill(200)
      p5.noStroke()
      p5.rect(x, y, hw, hh)
      p5.fill(0, 0, 0)

      const barW = hw / HISTOGRAM_BAR_SPAN
      const multiplier = (hh / maxH) * 0.9

      p5.textAlign(p5.LEFT)
      p5.textFont(font, 16)
      p5.stroke(128)
      p5.strokeWeight(2)

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

        p5.line(x, theY, x + hw, theY)

        if (i == 0) {
          theY -= 5
        }

        p5.text(i, x + hw + 5, theY + 7)
      }

      p5.textAlign(p5.CENTER)

      for (let i = HISTOGRAM_BAR_MIN; i <= HISTOGRAM_BAR_MAX; i += 10) {
        if (i == 0) {
          p5.stroke(0, 0, 255)
        } else {
          p5.stroke(128)
        }

        const theX = x + (i - HISTOGRAM_BAR_MIN) * barW

        p5.text(p5.nf(i / HISTOGRAM_BARS_PER_METER, 0, 1), theX, y + hh + 14)
        p5.line(theX, y, theX, y + hh)
      }

      p5.noStroke()

      for (let i = 0; i < HISTOGRAM_BAR_SPAN; i++) {
        const h = Math.min(
          appState.histogramBarCounts[appState.selectedGeneration][i] *
            multiplier,
          hh
        )

        if (
          i + HISTOGRAM_BAR_MIN ==
          Math.floor(
            appState.fitnessPercentileHistory[
              Math.min(
                appState.selectedGeneration,
                appState.fitnessPercentileHistory.length - 1
              )
            ][14] * HISTOGRAM_BARS_PER_METER
          )
        ) {
          p5.fill(255, 0, 0)
        } else {
          p5.fill(0, 0, 0)
        }

        p5.rect(x + i * barW, y + hh - h, barW, h)
      }
    }

    private drawLines(
      x: number,
      y: number,
      graphWidth: number,
      graphHeight: number
    ): void {
      const gh = graphHeight
      const genWidth = graphWidth / appState.generationCount
      const best = this.extreme(1)
      const worst = this.extreme(-1)
      const meterHeight = graphHeight / (best - worst)
      const zero = (best / (best - worst)) * gh
      const unit = this.setUnit(best, worst)

      graphImage.stroke(150)
      graphImage.strokeWeight(2)
      graphImage.fill(150)
      graphImage.textFont(font, 18)
      graphImage.textAlign(p5.RIGHT)

      for (
        let i = Math.ceil((worst - (best - worst) / 18.0) / unit) * unit;
        i < best + (best - worst) / 18.0;
        i += unit
      ) {
        const lineY = y - i * meterHeight + zero
        graphImage.line(x, lineY, graphWidth + x, lineY)
        graphImage.text(
          this.showUnit(i, unit) + ' ' + FITNESS_UNIT_LABEL,
          x - 5,
          lineY + 4
        )
      }

      graphImage.stroke(0)

      for (let i = 0; i < FITNESS_PERCENTILE_CREATURE_INDICES.length; i++) {
        let k

        if (i == 28) {
          k = 14
        } else if (i < 14) {
          k = i
        } else {
          k = i + 1
        }

        if (k == 14) {
          graphImage.stroke(255, 0, 0, 255)
          graphImage.strokeWeight(5)
        } else {
          p5.stroke(0)

          if (k == 0 || k == 28 || (k >= 10 && k <= 18)) {
            graphImage.strokeWeight(3)
          } else {
            graphImage.strokeWeight(1)
          }
        }

        for (let i = 0; i < appState.generationCount; i++) {
          graphImage.line(
            x + i * genWidth,
            -appState.fitnessPercentileHistory[i][k] * meterHeight + zero + y,
            x + (i + 1) * genWidth,
            -appState.fitnessPercentileHistory[i + 1][k] * meterHeight +
              zero +
              y
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
      segBarImage.noStroke()
      segBarImage.colorMode(p5.HSB, 1)
      segBarImage.background(0, 0, 0.5)

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
        const speciesCounts1 = appState.speciesCountsHistoryMap[i1] || []
        const speciesCounts2 = appState.speciesCountsHistoryMap[i2]

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
          segBarImage.fill(appView.getColor(speciesId, false))
          segBarImage.beginShape()

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
          segBarImage.vertex(barX1, y + start1 * graphHeight)
          segBarImage.vertex(barX1, y + start2 * graphHeight)
          segBarImage.vertex(barX2, y + end2 * graphHeight)
          segBarImage.vertex(barX2, y + end1 * graphHeight)

          segBarImage.endShape()
        })
      }

      p5.colorMode(p5.RGB, 255)
    }

    private drawWorstMedianAndBestCreatures(): void {
      p5.noStroke()
      p5.textAlign(p5.CENTER)

      const historyEntry =
        appState.generationHistoryMap[appState.selectedGeneration]

      for (let k = 0; k < 3; k++) {
        p5.fill(220)
        p5.rect(760 + k * 160, 180, 140, 140)

        p5.push()

        p5.translate(830 + 160 * k, 290)
        p5.scale(60.0 / SCALE_TO_FIX_BUG)

        const creature = historyEntry[historyEntryKeyForStatusWindow(k - 3)]

        creatureDrawer.drawCreature(creature, 0, 0, p5)

        p5.pop()
      }

      p5.fill(0)
      p5.textFont(font, 16)
      p5.text('Worst Creature', 830, 310)
      p5.text('Median Creature', 990, 310)
      p5.text('Best Creature', 1150, 310)
    }

    private extreme(sign: number): number {
      let record = -sign

      for (let i = 0; i < appState.generationCount; i++) {
        const toTest =
          appState.fitnessPercentileHistory[i + 1][toInt(14 - sign * 14)]

        if (toTest * sign > record * sign) {
          record = toTest
        }
      }

      return record
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
        return p5.nf(i, 0, 2) + ''
      }

      return toInt(i) + ''
    }
  }

  class GenerateCreaturesActivity extends Activity {
    private backButton: GeneratedCreaturesBackButton

    constructor() {
      super()

      this.backButton = new GeneratedCreaturesBackButton()
    }

    initialize(): void {
      appController.generateCreatures()

      p5.background(220, 253, 102)
      p5.push()
      p5.scale(10.0 / SCALE_TO_FIX_BUG)

      for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 40; x++) {
          const index = y * 40 + x
          const creature = appState.creaturesInLatestGeneration[index]

          creatureDrawer.drawCreature(creature, x * 3 + 5.5, y * 2.5 + 3, p5)
        }
      }

      p5.pop()
      p5.noStroke()
      p5.fill(0)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 24)
      p5.text(
        `Here are your ${CREATURE_COUNT} randomly generated creatures!!!`,
        appView.width / 2 - 200,
        690
      )
      this.backButton.draw()
    }

    onMouseReleased(): void {
      if (this.backButton.isUnderCursor()) {
        this.backButton.onClick()
      }
    }
  }

  class SimulationRunningActivity extends Activity {
    private skipButton: StepByStepSkipButton
    private playbackSpeedButton: StepByStepPlaybackSpeedButton
    private finishButton: StepByStepFinishButton

    constructor() {
      super()

      this.skipButton = new StepByStepSkipButton()
      this.playbackSpeedButton = new StepByStepPlaybackSpeedButton()
      this.finishButton = new StepByStepFinishButton()
    }

    draw(): void {
      if (appState.viewTimer <= 900) {
        for (let s = 0; s < simulationState.speed; s++) {
          if (appState.viewTimer < 900) {
            // For each point of speed, advance through one cycle of simulation.
            appController.advanceSimulation()
          }
        }

        this.updateCameraPosition()
        this.drawSimulationView()
        drawStats(appView.width - 10, 0, 0.7)

        this.skipButton.draw()
        this.playbackSpeedButton.draw()
        this.finishButton.draw()
      }

      if (appState.viewTimer == 900) {
        if (simulationState.speed < 30) {
          // When the simulation speed is slow enough, display the creature's fitness.
          this.drawFinalFitness()
        } else {
          // When the simulation speed is too fast, skip ahead to next simulation using the timer.
          appState.viewTimer = 1020
        }

        appController.setFitnessOfSimulationCreature()
      }

      if (appState.viewTimer >= 1020) {
        appState.creaturesTested++

        if (appState.creaturesTested < CREATURE_COUNT) {
          appController.setSimulationState(
            appState.creaturesInLatestGeneration[appState.creaturesTested]
          )
        } else {
          appController.setActivityId(ActivityId.SimulationFinished)
        }

        simulationState.camera.x = 0
      }

      if (appState.viewTimer >= 900) {
        appState.viewTimer += simulationState.speed
      }
    }

    onMouseReleased(): void {
      if (this.skipButton.isUnderCursor()) {
        this.skipButton.onClick()
      } else if (this.playbackSpeedButton.isUnderCursor()) {
        this.playbackSpeedButton.onClick()
      } else if (this.finishButton.isUnderCursor()) {
        this.finishButton.onClick()
      }
    }

    onMouseWheel(event: WheelEvent): void {
      const delta = event.deltaX

      if (delta < 0) {
        simulationState.camera.zoom *= 0.9090909

        if (simulationState.camera.zoom < 0.002) {
          simulationState.camera.zoom = 0.002
        }

        p5.textFont(font, POST_FONT_SIZE)
      } else if (delta > 0) {
        simulationState.camera.zoom *= 1.1

        if (simulationState.camera.zoom > 0.1) {
          simulationState.camera.zoom = 0.1
        }

        p5.textFont(font, POST_FONT_SIZE)
      }
    }

    private drawSimulationView(): void {
      const {averageX} = averagePositionOfNodes(simulationState.creature.nodes)

      p5.background(120, 200, 255)

      p5.push()

      p5.translate(p5.width / 2.0, p5.height / 2.0)
      p5.scale(1.0 / simulationState.camera.zoom / SCALE_TO_FIX_BUG)
      p5.translate(
        -simulationState.camera.x * SCALE_TO_FIX_BUG,
        -simulationState.camera.y * SCALE_TO_FIX_BUG
      )

      drawPosts(0)
      drawGround(1600, 900, p5)

      creatureDrawer.drawCreaturePieces(
        simulationState.creature.nodes,
        simulationState.creature.muscles,
        0,
        0,
        p5
      )
      drawArrow(averageX)

      p5.pop()
    }

    private drawFinalFitness(): void {
      const {averageX} = averagePositionOfNodes(simulationState.creature.nodes)

      p5.noStroke()
      p5.fill(0, 0, 0, 130)
      p5.rect(0, 0, appView.width, appView.height)
      p5.fill(0, 0, 0, 255)
      p5.rect(appView.width / 2 - 500, 200, 1000, 240)
      p5.fill(255, 0, 0)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 96)
      p5.text("Creature's " + FITNESS_LABEL + ':', appView.width / 2, 300)
      p5.text(
        p5.nf(averageX * 0.2, 0, 2) + ' ' + FITNESS_UNIT_LABEL,
        appView.width / 2,
        400
      )
    }

    private updateCameraPosition(): void {
      const {averageX, averageY} = averagePositionOfNodes(
        simulationState.creature.nodes
      )

      if (simulationState.speed < 30) {
        for (let s = 0; s < simulationState.speed; s++) {
          simulationState.camera.x +=
            (averageX - simulationState.camera.x) * 0.06
          simulationState.camera.y +=
            (averageY - simulationState.camera.y) * 0.06
        }
      } else {
        simulationState.camera.x = averageX
        simulationState.camera.y = averageY
      }
    }
  }

  class SimulationFinishedActivity extends Activity {
    private sortCreaturesButton: SortCreaturesButton

    constructor() {
      super()

      this.sortCreaturesButton = new SortCreaturesButton()
    }

    draw(): void {
      p5.image(appView.screenGraphics, 0, 0, appView.width, appView.height)

      /*
       * When the cursor is over any of the creature tiles, the popup simulation
       * will be displayed for the associated creature.
       */

      const gridIndex = getGridIndexUnderCursor(40, 17)

      if (gridIndex != null) {
        const creatureId = appState.creatureIdsByGridIndex[gridIndex]
        appController.setPopupSimulationCreatureId(creatureId)
        statusWindowView.draw()
      } else {
        appController.clearPopupSimulation()
      }
    }

    initialize(): void {
      appController.sortCreatures()
      appController.updateHistory()

      appState.viewTimer = 0
      appController.updateCreatureIdsByGridIndex()

      appView.screenGraphics.push()
      appView.screenGraphics.scale(15.0 / SCALE_TO_FIX_BUG)
      appView.screenGraphics.background(220, 253, 102)
      appView.screenGraphics.noStroke()

      for (let i = 0; i < CREATURE_COUNT; i++) {
        const creature = appState.sortedCreatures[i]
        const gridIndex = creatureIdToIndex(creature.id)

        const gridX = gridIndex % 40
        const gridY = Math.floor(gridIndex / 40)

        creatureDrawer.drawCreature(
          creature,
          gridX * 3 + 5.5,
          gridY * 2.5 + 4,
          appView.screenGraphics
        )
      }
      appView.screenGraphics.pop()

      appView.screenGraphics.push()
      appView.screenGraphics.scale(1.5)

      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.noStroke()

      appView.screenGraphics.fill(0)
      appView.screenGraphics.text(
        "All 1,000 creatures have been tested.  Now let's sort them!",
        appView.width / 2 - 200,
        690
      )
      this.sortCreaturesButton.draw()

      appView.screenGraphics.pop()
    }

    onMouseReleased(): void {
      if (this.sortCreaturesButton.isUnderCursor()) {
        this.sortCreaturesButton.onClick()
      }
    }
  }

  class SortingCreaturesActivity extends Activity {
    private skipButton: SortingCreaturesSkipButton

    constructor() {
      super()

      this.skipButton = new SortingCreaturesSkipButton()
    }

    draw(): void {
      p5.background(220, 253, 102)
      p5.push()
      p5.scale(10.0 / SCALE_TO_FIX_BUG)

      const transition =
        0.5 - 0.5 * Math.cos(Math.min(appState.viewTimer / 60, Math.PI))

      for (let i1 = 0; i1 < CREATURE_COUNT; i1++) {
        const creature = appState.sortedCreatures[i1]
        const j2 = creature.id - appState.generationCount * CREATURE_COUNT - 1
        const x1 = j2 % 40
        const y1 = Math.floor(j2 / 40)
        const x2 = i1 % 40
        const y2 = Math.floor(i1 / 40) + 1
        const x3 = this.interpolate(x1, x2, transition)
        const y3 = this.interpolate(y1, y2, transition)

        creatureDrawer.drawCreature(creature, x3 * 3 + 5.5, y3 * 2.5 + 4, p5)
      }

      p5.pop()

      this.skipButton.draw()
      if (
        appState.generationSimulationMode === GenerationSimulationMode.Quick
      ) {
        appState.viewTimer += 10
      } else {
        appState.viewTimer += 2
      }

      if (appState.viewTimer > 60 * Math.PI) {
        appState.viewTimer = 0
        appController.setActivityId(ActivityId.SortedCreatures)
      }
    }

    onMouseReleased(): void {
      if (this.skipButton.isUnderCursor()) {
        this.skipButton.onClick()
      }
    }

    private interpolate(a: number, b: number, offset: number): number {
      return a + (b - a) * offset
    }
  }

  class SortedCreaturesActivity extends Activity {
    private cullCreaturesButton: CullCreaturesButton

    constructor() {
      super()

      this.cullCreaturesButton = new CullCreaturesButton()
    }

    draw(): void {
      p5.image(appView.screenGraphics, 0, 0, appView.width, appView.height)

      /*
       * When the cursor is over any of the creature tiles, the popup simulation
       * will be displayed for the associated creature.
       */

      const gridIndex = getGridIndexUnderCursor(40, 42)

      if (gridIndex != null) {
        appController.setPopupSimulationCreatureId(gridIndex)
        statusWindowView.draw()
      } else {
        appController.clearPopupSimulation()
      }
    }

    initialize(): void {
      this.drawCreatureGrid()
    }

    onMouseReleased(): void {
      if (this.cullCreaturesButton.isUnderCursor()) {
        this.cullCreaturesButton.onClick()
      }
    }

    private drawCreatureGrid(): void {
      appView.screenGraphics.push()
      appView.screenGraphics.scale(15.0 / SCALE_TO_FIX_BUG)
      appView.screenGraphics.background(220, 253, 102)
      appView.screenGraphics.noStroke()

      for (let i = 0; i < CREATURE_COUNT; i++) {
        const creature = appState.sortedCreatures[i]
        const gridIndex = i

        const gridX = gridIndex % 40
        const gridY = Math.floor(gridIndex / 40) + 1

        creatureDrawer.drawCreature(
          creature,
          gridX * 3 + 5.5,
          gridY * 2.5 + 4,
          appView.screenGraphics
        )
      }
      appView.screenGraphics.pop()

      appView.screenGraphics.push()
      appView.screenGraphics.scale(1.5)

      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.noStroke()

      appView.screenGraphics.fill(0)
      appView.screenGraphics.text(
        'Fastest creatures at the top!',
        appView.width / 2,
        30
      )
      appView.screenGraphics.text(
        'Slowest creatures at the bottom. (Going backward = slow)',
        appView.width / 2 - 200,
        700
      )
      this.cullCreaturesButton.draw()

      appView.screenGraphics.pop()
    }
  }

  class CullCreaturesActivity extends Activity {
    private propagateCreaturesButton: PropagateCreaturesButton

    constructor() {
      super()

      this.propagateCreaturesButton = new PropagateCreaturesButton()
    }

    draw(): void {
      p5.image(appView.screenGraphics, 0, 0, appView.width, appView.height)

      /*
       * When the cursor is over any of the creature tiles, the popup simulation
       * will be displayed for the associated creature.
       */

      const gridIndex = getGridIndexUnderCursor(40, 42)

      if (gridIndex != null) {
        appController.setPopupSimulationCreatureId(gridIndex)
        statusWindowView.draw()
      } else {
        appController.clearPopupSimulation()
      }
    }

    initialize(): void {
      appController.cullCreatures()
      appState.viewTimer = 0

      appView.screenGraphics.push()
      appView.screenGraphics.scale(15.0 / SCALE_TO_FIX_BUG)
      appView.screenGraphics.background(220, 253, 102)
      appView.screenGraphics.noStroke()

      for (let i = 0; i < CREATURE_COUNT; i++) {
        const creature = appState.sortedCreatures[i]
        const gridIndex = i

        const gridX = gridIndex % 40
        const gridY = Math.floor(gridIndex / 40) + 1

        creatureDrawer.drawCreature(
          creature,
          gridX * 3 + 5.5,
          gridY * 2.5 + 4,
          appView.screenGraphics
        )
      }
      appView.screenGraphics.pop()

      appView.screenGraphics.push()
      appView.screenGraphics.scale(1.5)

      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.noStroke()

      appView.screenGraphics.fill(0)
      appView.screenGraphics.text(
        'Faster creatures are more likely to survive because they can outrun their predators.  Slow creatures get eaten.',
        appView.width / 2,
        30
      )
      appView.screenGraphics.text(
        'Because of random chance, a few fast ones get eaten, while a few slow ones survive.',
        appView.width / 2 - 130,
        700
      )
      this.propagateCreaturesButton.draw()

      for (let i = 0; i < CREATURE_COUNT; i++) {
        const creature = appState.sortedCreatures[i]
        const x = i % 40
        const y = Math.floor(i / 40) + 1

        if (creature.alive) {
          creatureDrawer.drawCreature(creature, x * 30 + 55, y * 25 + 40, p5)
        } else {
          appView.screenGraphics.rect(x * 30 + 40, y * 25 + 17, 30, 25)
        }
      }

      appView.screenGraphics.pop()
    }

    onMouseReleased(): void {
      if (this.propagateCreaturesButton.isUnderCursor()) {
        this.propagateCreaturesButton.onClick()
      }
    }
  }

  class PropagateCreaturesActivity extends Activity {
    private backButton: PropagatedCreaturesBackButton

    constructor() {
      super()

      this.backButton = new PropagatedCreaturesBackButton()
    }

    initialize(): void {
      appController.propagateCreatures()

      appState.viewTimer = 0
      this.drawCreatureGrid()
      p5.image(appView.screenGraphics, 0, 0, appView.width, appView.height)
    }

    onMouseReleased(): void {
      if (this.backButton.isUnderCursor()) {
        this.backButton.onClick()
      }
    }

    private drawCreatureGrid(): void {
      appView.screenGraphics.push()
      appView.screenGraphics.scale(15.0 / SCALE_TO_FIX_BUG)
      appView.screenGraphics.background(220, 253, 102)
      appView.screenGraphics.noStroke()

      for (let i = 0; i < CREATURE_COUNT; i++) {
        let creature = appState.sortedCreatures[i]
        const index = creatureIdToIndex(creature.id)
        creature = appState.creaturesInLatestGeneration[index]

        const gridIndex = i

        const gridX = gridIndex % 40
        const gridY = Math.floor(gridIndex / 40) + 1

        creatureDrawer.drawCreature(
          creature,
          gridX * 3 + 5.5,
          gridY * 2.5 + 4,
          appView.screenGraphics
        )
      }
      appView.screenGraphics.pop()

      appView.screenGraphics.push()
      appView.screenGraphics.scale(1.5)

      appView.screenGraphics.textAlign(p5.CENTER)
      appView.screenGraphics.textFont(font, 24)
      appView.screenGraphics.fill(100, 100, 200)
      appView.screenGraphics.noStroke()

      appView.screenGraphics.fill(0)
      appView.screenGraphics.text(
        'These are the 1000 creatures of generation #' +
          (appState.generationCount + 1) +
          '.',
        appView.width / 2,
        30
      )
      appView.screenGraphics.text(
        'What perils will they face?  Find out next time!',
        appView.width / 2 - 130,
        700
      )
      this.backButton.draw()

      appView.screenGraphics.pop()
    }
  }

  const activityClassByActivityId = {
    [ActivityId.Start]: StartActivity,
    [ActivityId.GenerationView]: GenerationViewActivity,
    [ActivityId.GenerateCreatures]: GenerateCreaturesActivity,
    [ActivityId.SimulationRunning]: SimulationRunningActivity,
    [ActivityId.SimulationFinished]: SimulationFinishedActivity,
    [ActivityId.SortingCreatures]: SortingCreaturesActivity,
    [ActivityId.SortedCreatures]: SortedCreaturesActivity,
    [ActivityId.CullCreatures]: CullCreaturesActivity,
    [ActivityId.PropagateCreatures]: PropagateCreaturesActivity
  }

  // COMPONENT DRAWING

  function drawGround(width: number, height: number, graphics: p5): void {
    const {averageX, averageY} = averagePositionOfNodes(
      simulationState.creature.nodes
    )

    const stairDrawStart = Math.max(
      1,
      toInt(-averageY / simulationConfig.hazelStairs) - 10
    )

    graphics.noStroke()
    graphics.fill(0, 130, 0)

    const groundX =
      (simulationState.camera.x - simulationState.camera.zoom * (width / 2)) *
      SCALE_TO_FIX_BUG
    const groundY = 0
    const groundW = simulationState.camera.zoom * width * SCALE_TO_FIX_BUG
    const groundH = simulationState.camera.zoom * height * SCALE_TO_FIX_BUG

    graphics.rect(groundX, groundY, groundW, groundH)

    if (simulationConfig.hazelStairs > 0) {
      for (let i = stairDrawStart; i < stairDrawStart + 20; i++) {
        graphics.fill(255, 255, 255, 128)
        graphics.rect(
          (averageX - 20) * SCALE_TO_FIX_BUG,
          -simulationConfig.hazelStairs * i * SCALE_TO_FIX_BUG,
          40 * SCALE_TO_FIX_BUG,
          simulationConfig.hazelStairs * 0.3 * SCALE_TO_FIX_BUG
        )
        graphics.fill(255, 255, 255, 255)
        graphics.rect(
          (averageX - 20) * SCALE_TO_FIX_BUG,
          -simulationConfig.hazelStairs * i * SCALE_TO_FIX_BUG,
          40 * SCALE_TO_FIX_BUG,
          simulationConfig.hazelStairs * 0.15 * SCALE_TO_FIX_BUG
        )
      }
    }
  }

  function drawPosts(toImage: number): void {
    const {averageX, averageY} = averagePositionOfNodes(
      simulationState.creature.nodes
    )
    const startPostY = Math.min(-8, toInt(averageY / 4) * 4 - 4)

    const graphics = [p5, null, popUpImage][toImage]

    if (graphics == null) {
      return
    }

    graphics.textAlign(p5.CENTER)
    graphics.textFont(font, POST_FONT_SIZE * SCALE_TO_FIX_BUG)
    graphics.noStroke()

    for (let postY = startPostY; postY <= startPostY + 8; postY += 4) {
      for (let i = toInt(averageX / 5 - 5); i <= toInt(averageX / 5 + 5); i++) {
        graphics.fill(255)
        graphics.rect(
          (i * 5 - 0.1) * SCALE_TO_FIX_BUG,
          (-3.0 + postY) * SCALE_TO_FIX_BUG,
          0.2 * SCALE_TO_FIX_BUG,
          3 * SCALE_TO_FIX_BUG
        )
        graphics.rect(
          (i * 5 - 1) * SCALE_TO_FIX_BUG,
          (-3.0 + postY) * SCALE_TO_FIX_BUG,
          2 * SCALE_TO_FIX_BUG,
          1 * SCALE_TO_FIX_BUG
        )
        graphics.fill(120)
        graphics.text(
          i + ' m',
          i * 5 * SCALE_TO_FIX_BUG,
          (-2.17 + postY) * SCALE_TO_FIX_BUG
        )
      }
    }
  }

  function drawArrow(x: number): void {
    p5.textAlign(p5.CENTER)
    p5.textFont(font, POST_FONT_SIZE * SCALE_TO_FIX_BUG)
    p5.noStroke()
    p5.fill(120, 0, 255)
    p5.rect(
      (x - 1.7) * SCALE_TO_FIX_BUG,
      -4.8 * SCALE_TO_FIX_BUG,
      3.4 * SCALE_TO_FIX_BUG,
      1.1 * SCALE_TO_FIX_BUG
    )
    p5.beginShape()
    p5.vertex(x * SCALE_TO_FIX_BUG, -3.2 * SCALE_TO_FIX_BUG)
    p5.vertex((x - 0.5) * SCALE_TO_FIX_BUG, -3.7 * SCALE_TO_FIX_BUG)
    p5.vertex((x + 0.5) * SCALE_TO_FIX_BUG, -3.7 * SCALE_TO_FIX_BUG)
    p5.endShape(p5.CLOSE)
    p5.fill(255)
    p5.text(
      Math.round(x * 2) / 10 + ' m',
      x * SCALE_TO_FIX_BUG,
      -3.91 * SCALE_TO_FIX_BUG
    )
  }

  function getGridIndexUnderCursor(
    gridStartX: number,
    gridStartY: number
  ): number | null {
    const creaturesPerRow = 40

    const gridWidth = 1200
    const gridHeight = 625

    const creatureTileWidth = 30
    const creatureTileHeight = 25

    if (
      appView.rectIsUnderCursor(
        gridStartX,
        gridStartY,
        gridWidth - 1,
        gridHeight - 1
      )
    ) {
      const {cursorX, cursorY} = appView.getCursorPosition()

      return (
        Math.floor((cursorX - gridStartX) / creatureTileWidth) +
        Math.floor((cursorY - gridStartY) / creatureTileHeight) *
          creaturesPerRow
      )
    }

    return null
  }

  function drawStats(x: number, y: number, size: number): void {
    p5.textAlign(p5.RIGHT)
    p5.textFont(font, 32)
    p5.fill(0)

    p5.push()

    p5.translate(x, y)
    p5.scale(size)
    p5.text('Creature ID: ' + simulationState.creature.id, 0, 32)

    let timeShow: number
    if (simulationState.speed > 60) {
      timeShow =
        toInt((appState.viewTimer + appState.creaturesTested * 37) / 60) % 15
    } else {
      timeShow = appState.viewTimer / 60
    }

    p5.text('Time: ' + p5.nf(timeShow, 0, 2) + ' / 15 sec.', 0, 64)
    p5.text('Playback Speed: x' + Math.max(1, simulationState.speed), 0, 96)

    const {averageX, averageY} = averagePositionOfNodes(
      simulationState.creature.nodes
    )

    p5.text('X: ' + p5.nf(averageX / 5.0, 0, 2) + '', 0, 128)
    p5.text('Y: ' + p5.nf(-averageY / 5.0, 0, 2) + '', 0, 160)
    p5.text(
      'Energy used: ' +
        p5.nf(simulationState.creature.energyUsed, 0, 2) +
        ' yums',
      0,
      192
    )
    p5.text(
      'A.N.Nausea: ' +
        p5.nf(simulationState.creature.averageNodeNausea, 0, 2) +
        ' blehs',
      0,
      224
    )

    p5.pop()
  }

  p5.mouseWheel = (event: WheelEvent) => {
    appState.currentActivity.onMouseWheel(event)
  }

  p5.mousePressed = () => {
    appState.currentActivity.onMousePressed()

    if (appState.pendingGenerationCount >= 1) {
      appState.pendingGenerationCount = 0
    }
  }

  p5.mouseReleased = () => {
    // When the popup simulation is running, mouse clicks will stop it.
    appState.showPopupSimulation = false

    appState.currentActivity.onMouseReleased()
  }

  p5.preload = () => {
    font = p5.loadFont('/fonts/Helvetica-Bold.otf')
  }

  p5.setup = () => {
    p5.frameRate(FRAME_RATE)
    p5.randomSeed(SEED)

    appView = new AppView({
      font,
      height: 720,
      p5,
      scale: 0.8,
      width: 1280
    })

    appState.fitnessPercentileHistory.push(
      new Array(FITNESS_PERCENTILE_CREATURE_INDICES.length).fill(0.0)
    )
    appState.histogramBarCounts.push(new Array(HISTOGRAM_BAR_SPAN).fill(0))

    graphImage = p5.createGraphics(975, 570)
    popUpImage = p5.createGraphics(450, 450)
    segBarImage = p5.createGraphics(975, 150)

    segBarImage.background(220)
    popUpImage.background(220)

    creatureDrawer = new CreatureDrawer({
      axonColor: p5.color(255, 255, 0),
      axonFont: font
    })
  }

  p5.draw = () => {
    p5.scale(appView.scale)

    const {currentActivityId, nextActivityId} = appState

    if (nextActivityId !== currentActivityId) {
      const ActivityClass = activityClassByActivityId[nextActivityId]
      appState.currentActivity = new ActivityClass()
      appState.currentActivityId = nextActivityId

      appState.currentActivity.initialize()
    }

    appState.currentActivity.draw()
  }
}
