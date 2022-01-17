import type p5 from 'p5'
import type {Font, Graphics} from 'p5'

import Creature from './Creature'
import Simulation from './Simulation'
import {Activity, ActivityConfig, NullActivity} from './activities'
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
import {AppView, SimulationView} from './views'

export default function sketch(p5: p5) {
  const FITNESS_LABEL = 'Distance'
  const FITNESS_UNIT_LABEL = 'm'
  const FONT_SIZES = [50, 36, 25, 20, 16, 14, 11, 9]
  const FRAME_RATE = 60 // target frames per second
  const SEED = 0

  let font: Font

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

  interface WidgetConfig {
    appController: AppController
    appState: AppState
    appView: AppView
  }

  abstract class Widget {
    protected appController: AppController
    protected appState: AppState
    protected appView: AppView

    constructor(config: WidgetConfig) {
      this.appController = config.appController
      this.appState = config.appState
      this.appView = config.appView
    }

    abstract draw(): void
  }

  class StartViewStartButton extends Widget {
    draw(): void {
      const {canvas, width} = this.appView

      canvas.noStroke()
      canvas.fill(100, 200, 100)
      canvas.rect(width / 2 - 200, 300, 400, 200)
      canvas.fill(0)
      canvas.text('START', width / 2, 430)
    }

    isUnderCursor(): boolean {
      const {appView} = this
      return appView.rectIsUnderCursor(appView.width / 2 - 200, 300, 400, 200)
    }

    onClick(): void {
      this.appController.setActivityId(ActivityId.GenerationView)
    }
  }

  class GenerationViewCreateButton extends Widget {
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

    onClick(): void {
      this.appController.setActivityId(ActivityId.GenerateCreatures)
    }
  }

  class GeneratedCreaturesBackButton extends Widget {
    draw(): void {
      const {canvas, font, width} = this.appView

      canvas.noStroke()
      canvas.fill(100, 100, 200)
      canvas.rect(900, 664, 260, 40)
      canvas.fill(0)
      canvas.textAlign(canvas.CENTER)
      canvas.textFont(font, 24)
      canvas.text('Back', width - 250, 690)
    }

    isUnderCursor(): boolean {
      return this.appView.rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      this.appState.generationCount = 0
      this.appController.setActivityId(ActivityId.GenerationView)
    }
  }

  class SimulateStepByStepButton extends Widget {
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

    onClick(): void {
      this.appController.performStepByStepSimulation()
    }
  }

  class SimulateQuickButton extends Widget {
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

    onClick(): void {
      this.appController.performQuickGenerationSimulation()
    }
  }

  class SimulateAsapButton extends Widget {
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

    onClick(): void {
      this.appState.pendingGenerationCount = 1
      this.appController.startASAP()
    }
  }

  class SimulateAlapButton extends Widget {
    draw(): void {
      const {canvas} = this.appView

      canvas.noStroke()

      if (this.appState.pendingGenerationCount >= 2) {
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

    onClick(): void {
      this.appState.pendingGenerationCount = 1000000000
      this.appController.startASAP()
    }
  }

  class StepByStepSkipButton extends Widget {
    draw(): void {
      const {canvas, font, height} = this.appView

      canvas.fill(0)
      canvas.rect(0, height - 40, 90, 40)
      canvas.fill(255)
      canvas.textAlign(canvas.CENTER)
      canvas.textFont(font, 32)
      canvas.text('SKIP', 45, height - 8)
    }

    isUnderCursor(): boolean {
      const {appView} = this
      return appView.rectIsUnderCursor(0, appView.height - 40, 90, 40)
    }

    onClick(): void {
      for (let s = this.appState.viewTimer; s < 900; s++) {
        this.appController.advanceSimulation()
      }

      this.appState.viewTimer = 1021
    }
  }

  interface StepByStepPlaybackSpeedButtonConfig extends WidgetConfig {
    simulationState: SimulationState
  }

  class StepByStepPlaybackSpeedButton extends Widget {
    private simulationState: SimulationState

    constructor(config: StepByStepPlaybackSpeedButtonConfig) {
      super(config)

      this.simulationState = config.simulationState
    }

    draw(): void {
      const {canvas, font, height} = this.appView

      canvas.fill(0)
      canvas.rect(120, height - 40, 240, 40)
      canvas.fill(255)
      canvas.textAlign(canvas.CENTER)
      canvas.textFont(font, 32)
      canvas.text('PB speed: x' + this.simulationState.speed, 240, height - 8)
    }

    isUnderCursor(): boolean {
      const {appView} = this
      return appView.rectIsUnderCursor(120, appView.height - 40, 240, 40)
    }

    onClick(): void {
      this.simulationState.speed *= 2

      if (this.simulationState.speed === 1024) {
        this.simulationState.speed = 900
      }

      if (this.simulationState.speed >= 1800) {
        this.simulationState.speed = 1
      }
    }
  }

  class StepByStepFinishButton extends Widget {
    draw(): void {
      const {canvas, font, height, width} = this.appView

      canvas.fill(0)
      canvas.rect(width - 120, height - 40, 120, 40)
      canvas.fill(255)
      canvas.textAlign(canvas.CENTER)
      canvas.textFont(font, 32)
      canvas.text('FINISH', width - 60, height - 8)
    }

    isUnderCursor(): boolean {
      const {height, width} = this.appView

      return this.appView.rectIsUnderCursor(width - 120, height - 40, 120, 40)
    }

    onClick(): void {
      this.appController.finishGenerationSimulation()
    }
  }

  class SortCreaturesButton extends Widget {
    draw(): void {
      const {canvas, font, screenGraphics, width} = this.appView

      screenGraphics.noStroke()
      screenGraphics.fill(100, 100, 200)
      screenGraphics.rect(900, 664, 260, 40)
      screenGraphics.fill(0)
      screenGraphics.textAlign(canvas.CENTER)
      screenGraphics.textFont(font, 24)
      screenGraphics.text('Sort', width - 250, 690)
    }

    isUnderCursor(): boolean {
      return this.appView.rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      this.appController.setActivityId(ActivityId.SortingCreatures)
    }
  }

  class SortingCreaturesSkipButton extends Widget {
    draw(): void {
      const {canvas, font, height} = this.appView

      canvas.fill(0)
      canvas.rect(0, height - 40, 90, 40)
      canvas.fill(255)
      canvas.textAlign(canvas.CENTER)
      canvas.textFont(font, 32)
      canvas.text('SKIP', 45, height - 8)
    }

    isUnderCursor(): boolean {
      const {appView} = this
      return appView.rectIsUnderCursor(0, appView.height - 40, 90, 40)
    }

    onClick(): void {
      this.appState.viewTimer = 100000
    }
  }

  class CullCreaturesButton extends Widget {
    draw(): void {
      const {canvas, font, screenGraphics, width} = this.appView

      screenGraphics.noStroke()
      screenGraphics.fill(100, 100, 200)
      screenGraphics.rect(900, 670, 260, 40)
      screenGraphics.fill(0)
      screenGraphics.textAlign(canvas.CENTER)
      screenGraphics.textFont(font, 24)
      screenGraphics.text(
        `Kill ${Math.floor(CREATURE_COUNT / 2)}`,
        width - 250,
        700
      )
    }

    isUnderCursor(): boolean {
      return this.appView.rectIsUnderCursor(900, 670, 260, 40)
    }

    onClick(): void {
      this.appController.setActivityId(ActivityId.CullCreatures)
    }
  }

  class PropagateCreaturesButton extends Widget {
    draw(): void {
      const {canvas, font, screenGraphics, width} = this.appView

      screenGraphics.noStroke()
      screenGraphics.fill(100, 100, 200)
      screenGraphics.rect(1050, 670, 160, 40)
      screenGraphics.fill(0)
      screenGraphics.textAlign(canvas.CENTER)
      screenGraphics.textFont(font, 24)
      screenGraphics.text('Reproduce', width - 150, 700)
    }

    isUnderCursor(): boolean {
      return this.appView.rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      this.appController.setActivityId(ActivityId.PropagateCreatures)
    }
  }

  class PropagatedCreaturesBackButton extends Widget {
    draw(): void {
      const {canvas, font, screenGraphics, width} = this.appView

      screenGraphics.noStroke()
      screenGraphics.fill(100, 100, 200)
      screenGraphics.rect(1050, 670, 160, 40)
      screenGraphics.fill(0)
      screenGraphics.textAlign(canvas.CENTER)
      screenGraphics.textFont(font, 24)
      screenGraphics.text('Back', width - 150, 700)
    }

    isUnderCursor(): boolean {
      return this.appView.rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      this.appController.setActivityId(ActivityId.GenerationView)
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
        fs = Math.floor(
          Math.log(this.appState.selectedGeneration) / Math.log(10)
        )
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

  interface PopupSimulationViewConfig extends WidgetConfig {
    simulationConfig: SimulationConfig
    simulationState: SimulationState
  }

  class PopupSimulationView extends Widget {
    private simulationView: SimulationView
    private simulationConfig: SimulationConfig
    private simulationState: SimulationState

    constructor(config: PopupSimulationViewConfig) {
      super(config)

      this.simulationConfig = config.simulationConfig
      this.simulationState = config.simulationState

      const {canvas, font} = this.appView

      this.simulationView = new SimulationView({
        appState: this.appState,
        creatureDrawer: new CreatureDrawer({appView: this.appView}),
        height: 600,
        p5: canvas,
        postFont: font,
        showArrow: false,
        simulationConfig: this.simulationConfig,
        simulationState: this.simulationState,
        statsFont: font,
        width: 600
      })
    }

    deinitialize(): void {
      this.simulationView.deinitialize()
    }

    draw(): void {
      const {appState} = this

      const {canvas, font} = this.appView

      let x, y, px, py
      let rank = appState.statusWindow + 1
      let creature

      canvas.stroke(Math.abs((canvas.frameCount % 30) - 15) * 17) // oscillate between 0–255
      canvas.strokeWeight(3)
      canvas.noFill()

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

        canvas.rect(x * 30 + 40, y * 25 + 17, 30, 25)
      } else {
        const historyEntry =
          appState.generationHistoryMap[appState.selectedGeneration]
        creature =
          historyEntry[historyEntryKeyForStatusWindow(appState.statusWindow)]

        x = 760 + (appState.statusWindow + 3) * 160
        y = 180
        px = x
        py = y
        canvas.rect(x, y, 140, 140)

        const ranks = [CREATURE_COUNT, Math.floor(CREATURE_COUNT / 2), 1]
        rank = ranks[appState.statusWindow + 3]
      }

      canvas.noStroke()
      canvas.fill(255)
      canvas.rect(px - 60, py, 120, 52)
      canvas.fill(0)
      canvas.textFont(font, 12)
      canvas.textAlign(canvas.CENTER)
      canvas.text('#' + rank, px, py + 12)
      canvas.text('ID: ' + creature.id, px, py + 24)
      canvas.text('Fitness: ' + canvas.nf(creature.fitness, 0, 3), px, py + 36)
      canvas.colorMode(canvas.HSB, 1)

      const sp =
        (creature.nodes.length % 10) * 10 + (creature.muscles.length % 10)
      canvas.fill(this.appView.getColor(sp, true))
      canvas.text(
        'Species: S' +
          (creature.nodes.length % 10) +
          '' +
          (creature.muscles.length % 10),
        px,
        py + 48
      )
      canvas.colorMode(canvas.RGB, 255)

      if (appState.showPopupSimulation) {
        this.drawPopupSimulation(px, py)
      }
    }

    private drawPopupSimulation(px: number, py: number): void {
      const {camera, creature} = this.simulationState

      let py2 = py - 125
      if (py >= 360) {
        py2 -= 180
      } else {
        py2 += 180
      }

      const px2 = Math.min(Math.max(px - 90, 10), 970)

      camera.zoom = 0.009

      const {averageX, averageY} = averagePositionOfNodes(creature.nodes)
      camera.x += (averageX - camera.x) * 0.1
      camera.y += (averageY - camera.y) * 0.1

      this.simulationView.draw()

      this.appView.canvas.image(
        this.simulationView.graphics,
        px2,
        py2,
        300,
        300
      )

      this.appController.advanceSimulation()
    }
  }

  interface CreatureGridConfig {
    appView: AppView

    getCreatureAndGridIndexFn: (index: number) => {
      creature: Creature
      gridIndex: number
    }
  }

  class CreatureGridView {
    private config: CreatureGridConfig
    private creatureDrawer: CreatureDrawer

    graphics: Graphics

    constructor(config: CreatureGridConfig) {
      this.config = config

      this.creatureDrawer = new CreatureDrawer({appView: config.appView})

      const creatureTileWidth = 30
      const creatureTileHeight = 25
      const creaturesPerRow = 40
      const creaturesPerColumn = CREATURE_COUNT / creaturesPerRow

      const width = (creaturesPerRow + 1) * creatureTileWidth
      const height = (creaturesPerColumn + 1) * creatureTileHeight

      this.graphics = config.appView.canvas.createGraphics(width, height)
    }

    deinitialize(): void {
      this.graphics.remove()
    }

    draw(): void {
      const {getCreatureAndGridIndexFn} = this.config
      const {graphics} = this

      const scale = 10
      const creatureWidth = 30
      const creatureHeight = 25
      const creaturesPerRow = 40

      graphics.clear()
      graphics.push()
      graphics.scale(scale / SCALE_TO_FIX_BUG)

      const creatureScale = 0.1

      const scaledCreatureWidth = creatureWidth * creatureScale
      const scaledCreatureHeight = creatureHeight * creatureScale

      const marginX = scaledCreatureWidth
      const marginY = scaledCreatureHeight / 2 + scaledCreatureHeight

      const blankMarginX = scaledCreatureWidth / 2
      const blankMarginY = scaledCreatureHeight / 2

      const blankWidth = scaledCreatureWidth * SCALE_TO_FIX_BUG
      const blankHeight = scaledCreatureHeight * SCALE_TO_FIX_BUG

      for (let i = 0; i < CREATURE_COUNT; i++) {
        const {creature, gridIndex} = getCreatureAndGridIndexFn(i)

        const gridX = gridIndex % creaturesPerRow
        const gridY = Math.floor(gridIndex / creaturesPerRow)

        if (creature.alive) {
          const creatureCenterX = gridX * scaledCreatureWidth + marginX
          const creatureBottomY = gridY * scaledCreatureHeight + marginY

          this.creatureDrawer.drawCreature(
            creature,
            creatureCenterX,
            creatureBottomY,
            graphics
          )
        } else {
          const blankLeftX =
            (gridX * scaledCreatureWidth + blankMarginX) * SCALE_TO_FIX_BUG
          const blankTopY =
            (gridY * scaledCreatureHeight + blankMarginY) * SCALE_TO_FIX_BUG

          graphics.fill(0)
          graphics.rect(blankLeftX, blankTopY, blankWidth, blankHeight)
        }
      }

      graphics.pop()
    }

    getGridIndexUnderCursor(
      gridStartX: number,
      gridStartY: number
    ): number | null {
      const {appView} = this.config

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
  }

  class StartActivity extends Activity {
    private startButton: StartViewStartButton

    constructor(config: ActivityConfig) {
      super(config)

      this.startButton = new StartViewStartButton({
        appController: this.appController,
        appState: this.appState,
        appView: this.appView
      })
    }

    initialize(): void {
      const {canvas, width} = this.appView

      canvas.background(255)
      canvas.noStroke()
      canvas.fill(0)
      canvas.text('EVOLUTION!', width / 2, 200)

      this.startButton.draw()
    }

    onMouseReleased(): void {
      if (this.startButton.isUnderCursor()) {
        this.startButton.onClick()
      }
    }
  }

  class GenerationViewActivity extends Activity {
    private popupSimulationView: PopupSimulationView
    private createButton: GenerationViewCreateButton
    private stepByStepButton: SimulateStepByStepButton
    private quickButton: SimulateQuickButton
    private asapButton: SimulateAsapButton
    private alapButton: SimulateAlapButton
    private generationSlider: GenerationSlider

    private creatureDrawer: CreatureDrawer

    private draggingSlider: boolean

    private generationHistoryGraphics: Graphics
    private graphGraphics: Graphics

    constructor(config: ActivityConfig) {
      super(config)

      this.creatureDrawer = new CreatureDrawer({appView: this.appView})

      const widgetConfig = {
        appController: this.appController,
        appState: this.appState,
        appView: this.appView
      }

      const simulationWidgetConfig = {
        ...widgetConfig,
        simulationConfig,
        simulationState
      }

      this.popupSimulationView = new PopupSimulationView(simulationWidgetConfig)
      this.createButton = new GenerationViewCreateButton(widgetConfig)
      this.stepByStepButton = new SimulateStepByStepButton(widgetConfig)
      this.quickButton = new SimulateQuickButton(widgetConfig)
      this.asapButton = new SimulateAsapButton(widgetConfig)
      this.alapButton = new SimulateAlapButton(widgetConfig)
      this.generationSlider = new GenerationSlider(widgetConfig)

      this.draggingSlider = false

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

        canvas.fill(0)
        canvas.text('Median ' + FITNESS_LABEL, 50, 160)
        canvas.textAlign(canvas.CENTER)
        canvas.textAlign(canvas.RIGHT)
        canvas.text(
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
            this.popupSimulationView.draw()
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
        this.appState.generationCount >= 1 &&
        this.generationSlider.isUnderCursor()
      ) {
        this.draggingSlider = true
      }
    }

    onMouseReleased(): void {
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
        if (
          appState.histogramBarCounts[appState.selectedGeneration][i] > maxH
        ) {
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

        if (i == 28) {
          k = 14
        } else if (i < 14) {
          k = i
        } else {
          k = i + 1
        }

        if (k == 14) {
          this.graphGraphics.stroke(255, 0, 0, 255)
          this.graphGraphics.strokeWeight(5)
        } else {
          canvas.stroke(0)

          if (k == 0 || k == 28 || (k >= 10 && k <= 18)) {
            this.graphGraphics.strokeWeight(3)
          } else {
            this.graphGraphics.strokeWeight(1)
          }
        }

        for (let i = 0; i < appState.generationCount; i++) {
          this.graphGraphics.line(
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
          this.generationHistoryGraphics.fill(
            appView.getColor(speciesId, false)
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

      const historyEntry =
        this.appState.generationHistoryMap[this.appState.selectedGeneration]

      for (let k = 0; k < 3; k++) {
        canvas.fill(220)
        canvas.rect(760 + k * 160, 180, 140, 140)

        canvas.push()

        canvas.translate(830 + 160 * k, 290)
        canvas.scale(60.0 / SCALE_TO_FIX_BUG)

        const creature = historyEntry[historyEntryKeyForStatusWindow(k - 3)]

        this.creatureDrawer.drawCreature(creature, 0, 0, canvas)

        canvas.pop()
      }

      canvas.fill(0)
      canvas.textFont(font, 16)
      canvas.text('Worst Creature', 830, 310)
      canvas.text('Median Creature', 990, 310)
      canvas.text('Best Creature', 1150, 310)
    }

    private extreme(sign: number): number {
      let record = -sign

      for (let i = 0; i < this.appState.generationCount; i++) {
        const toTest =
          this.appState.fitnessPercentileHistory[i + 1][toInt(14 - sign * 14)]

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
        return this.appView.canvas.nf(i, 0, 2) + ''
      }

      return toInt(i) + ''
    }
  }

  class GenerateCreaturesActivity extends Activity {
    private creatureGridView: CreatureGridView
    private backButton: GeneratedCreaturesBackButton

    constructor(config: ActivityConfig) {
      super(config)

      const getCreatureAndGridIndexFn = (index: number) => {
        return {
          creature: this.appState.creaturesInLatestGeneration[index],
          gridIndex: index
        }
      }

      this.creatureGridView = new CreatureGridView({
        appView: this.appView,
        getCreatureAndGridIndexFn
      })

      this.backButton = new GeneratedCreaturesBackButton({
        appController: this.appController,
        appState: this.appState,
        appView: this.appView
      })
    }

    deinitialize(): void {
      this.creatureGridView.deinitialize()
    }

    initialize(): void {
      this.appController.generateCreatures()

      this.drawInterface()
      this.drawCreatureGrid()
    }

    onMouseReleased(): void {
      if (this.backButton.isUnderCursor()) {
        this.backButton.onClick()
      }
    }

    private drawCreatureGrid(): void {
      this.creatureGridView.draw()

      const gridStartX = 25 // 40 minus horizontal grid margin
      const gridStartY = 5 // 17 minus vertical grid margin

      this.appView.canvas.image(
        this.creatureGridView.graphics,
        gridStartX,
        gridStartY
      )
    }

    private drawInterface(): void {
      const {canvas, font, width} = this.appView

      canvas.background(220, 253, 102)

      canvas.noStroke()
      canvas.fill(0)
      canvas.textAlign(canvas.CENTER)
      canvas.textFont(font, 24)
      canvas.text(
        `Here are your ${CREATURE_COUNT} randomly generated creatures!!!`,
        width / 2 - 200,
        690
      )
      this.backButton.draw()
    }
  }

  class SimulationRunningActivity extends Activity {
    private simulationView: SimulationView
    private skipButton: StepByStepSkipButton
    private playbackSpeedButton: StepByStepPlaybackSpeedButton
    private finishButton: StepByStepFinishButton

    constructor(config: ActivityConfig) {
      super(config)

      const {canvas, font} = this.appView

      this.simulationView = new SimulationView({
        appState: this.appState,
        creatureDrawer: new CreatureDrawer({appView: this.appView}),
        height: 900,
        p5: canvas,
        postFont: font,
        showArrow: true,
        simulationConfig,
        simulationState,
        statsFont: font,
        width: 1600
      })

      const widgetConfig = {
        appController: this.appController,
        appState: this.appState,
        appView: this.appView
      }

      const simulationWidgetConfig = {
        ...widgetConfig,
        simulationState
      }

      this.skipButton = new StepByStepSkipButton(widgetConfig)
      this.playbackSpeedButton = new StepByStepPlaybackSpeedButton(
        simulationWidgetConfig
      )
      this.finishButton = new StepByStepFinishButton(widgetConfig)
    }

    deinitialize(): void {
      this.simulationView.deinitialize()
    }

    draw(): void {
      const {appController, appState, appView} = this
      const {canvas, height, width} = appView

      if (appState.viewTimer <= 900) {
        for (let s = 0; s < simulationState.speed; s++) {
          if (appState.viewTimer < 900) {
            // For each point of speed, advance through one cycle of simulation.
            appController.advanceSimulation()
          }
        }

        this.updateCameraPosition()
        this.simulationView.draw()

        canvas.image(this.simulationView.graphics, 0, 0, width, height)

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
      const {canvas, font} = this.appView

      const delta = event.deltaX

      if (delta < 0) {
        simulationState.camera.zoom *= 0.9090909

        if (simulationState.camera.zoom < 0.002) {
          simulationState.camera.zoom = 0.002
        }

        canvas.textFont(font, POST_FONT_SIZE)
      } else if (delta > 0) {
        simulationState.camera.zoom *= 1.1

        if (simulationState.camera.zoom > 0.1) {
          simulationState.camera.zoom = 0.1
        }

        canvas.textFont(font, POST_FONT_SIZE)
      }
    }

    private drawFinalFitness(): void {
      const {canvas, font, height, width} = this.appView

      const {averageX} = averagePositionOfNodes(simulationState.creature.nodes)

      canvas.noStroke()
      canvas.fill(0, 0, 0, 130)
      canvas.rect(0, 0, width, height)
      canvas.fill(0, 0, 0, 255)
      canvas.rect(width / 2 - 500, 200, 1000, 240)
      canvas.fill(255, 0, 0)
      canvas.textAlign(canvas.CENTER)
      canvas.textFont(font, 96)
      canvas.text("Creature's " + FITNESS_LABEL + ':', width / 2, 300)
      canvas.text(
        canvas.nf(averageX * 0.2, 0, 2) + ' ' + FITNESS_UNIT_LABEL,
        width / 2,
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
    private creatureGridView: CreatureGridView
    private popupSimulationView: PopupSimulationView
    private sortCreaturesButton: SortCreaturesButton

    constructor(config: ActivityConfig) {
      super(config)

      const getCreatureAndGridIndexFn = (index: number) => {
        const creature = this.appState.sortedCreatures[index]
        const gridIndex = creatureIdToIndex(creature.id)

        return {creature, gridIndex}
      }

      this.creatureGridView = new CreatureGridView({
        appView: this.appView,
        getCreatureAndGridIndexFn
      })

      const widgetConfig = {
        appController: this.appController,
        appState: this.appState,
        appView: this.appView
      }

      const simulationWidgetConfig = {
        ...widgetConfig,
        simulationConfig,
        simulationState
      }

      this.popupSimulationView = new PopupSimulationView(simulationWidgetConfig)
      this.sortCreaturesButton = new SortCreaturesButton(widgetConfig)
    }

    deinitialize(): void {
      this.creatureGridView.deinitialize()
      this.popupSimulationView.deinitialize()
    }

    draw(): void {
      const {canvas, height, screenGraphics, width} = this.appView
      const {creatureGridView} = this

      canvas.image(screenGraphics, 0, 0, width, height)

      const gridStartX = 25 // 40 minus horizontal grid margin
      const gridStartY = 5 // 17 minus vertical grid margin

      canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

      /*
       * When the cursor is over any of the creature tiles, the popup simulation
       * will be displayed for the associated creature.
       */

      const gridIndex = creatureGridView.getGridIndexUnderCursor(40, 17)

      if (gridIndex != null) {
        const creatureId = this.appState.creatureIdsByGridIndex[gridIndex]
        this.appController.setPopupSimulationCreatureId(creatureId)
        this.popupSimulationView.draw()
      } else {
        this.appController.clearPopupSimulation()
      }
    }

    initialize(): void {
      const {appController, appState} = this

      appController.sortCreatures()
      appController.updateHistory()

      appState.viewTimer = 0
      appController.updateCreatureIdsByGridIndex()

      this.drawInterface()
      this.creatureGridView.draw()
    }

    onMouseReleased(): void {
      if (this.sortCreaturesButton.isUnderCursor()) {
        this.sortCreaturesButton.onClick()
      }
    }

    private drawInterface(): void {
      const {canvas, font, screenGraphics, width} = this.appView

      screenGraphics.background(220, 253, 102)

      screenGraphics.push()
      screenGraphics.scale(1.5)

      screenGraphics.textAlign(canvas.CENTER)
      screenGraphics.textFont(font, 24)
      screenGraphics.fill(100, 100, 200)
      screenGraphics.noStroke()

      screenGraphics.fill(0)
      screenGraphics.text(
        "All 1,000 creatures have been tested.  Now let's sort them!",
        width / 2 - 200,
        690
      )
      this.sortCreaturesButton.draw()

      screenGraphics.pop()
    }
  }

  class SortingCreaturesActivity extends Activity {
    private creatureDrawer: CreatureDrawer

    private skipButton: SortingCreaturesSkipButton

    constructor(config: ActivityConfig) {
      super(config)

      this.creatureDrawer = new CreatureDrawer({appView: this.appView})

      this.skipButton = new SortingCreaturesSkipButton({
        appController: this.appController,
        appState: this.appState,
        appView: this.appView
      })
    }

    draw(): void {
      const {appState, appView} = this
      const {canvas} = appView

      canvas.background(220, 253, 102)
      canvas.push()
      canvas.scale(10.0 / SCALE_TO_FIX_BUG)

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

        this.creatureDrawer.drawCreature(
          creature,
          x3 * 3 + 5.5,
          y3 * 2.5 + 4,
          canvas
        )
      }

      canvas.pop()

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
        this.appController.setActivityId(ActivityId.SortedCreatures)
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
    private creatureGridView: CreatureGridView
    private popupSimulationView: PopupSimulationView
    private cullCreaturesButton: CullCreaturesButton

    constructor(config: ActivityConfig) {
      super(config)

      const getCreatureAndGridIndexFn = (index: number) => {
        return {
          creature: this.appState.sortedCreatures[index],
          gridIndex: index
        }
      }

      this.creatureGridView = new CreatureGridView({
        appView: this.appView,
        getCreatureAndGridIndexFn
      })

      const widgetConfig = {
        appController: this.appController,
        appState: this.appState,
        appView: this.appView
      }

      const simulationWidgetConfig = {
        ...widgetConfig,
        simulationConfig,
        simulationState
      }

      this.popupSimulationView = new PopupSimulationView(simulationWidgetConfig)
      this.cullCreaturesButton = new CullCreaturesButton(widgetConfig)
    }

    deinitialize(): void {
      this.creatureGridView.deinitialize()
      this.popupSimulationView.deinitialize()
    }

    draw(): void {
      const {canvas, height, screenGraphics, width} = this.appView
      const {creatureGridView} = this

      canvas.image(screenGraphics, 0, 0, width, height)

      const gridStartX = 25 // 40 minus horizontal grid margin
      const gridStartY = 28 // 40 minus vertical grid margin

      canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

      /*
       * When the cursor is over any of the creature tiles, the popup simulation
       * will be displayed for the associated creature.
       */

      const gridIndex = creatureGridView.getGridIndexUnderCursor(40, 42)

      if (gridIndex != null) {
        this.appController.setPopupSimulationCreatureId(gridIndex)
        this.popupSimulationView.draw()
      } else {
        this.appController.clearPopupSimulation()
      }
    }

    initialize(): void {
      this.drawInterface()
      this.creatureGridView.draw()
    }

    onMouseReleased(): void {
      if (this.cullCreaturesButton.isUnderCursor()) {
        this.cullCreaturesButton.onClick()
      }
    }

    private drawInterface(): void {
      const {canvas, font, screenGraphics, width} = this.appView

      screenGraphics.background(220, 253, 102)

      screenGraphics.push()
      screenGraphics.scale(1.5)

      screenGraphics.textAlign(canvas.CENTER)
      screenGraphics.textFont(font, 24)
      screenGraphics.fill(100, 100, 200)
      screenGraphics.noStroke()

      screenGraphics.fill(0)
      screenGraphics.text('Fastest creatures at the top!', width / 2, 30)
      screenGraphics.text(
        'Slowest creatures at the bottom. (Going backward = slow)',
        width / 2 - 200,
        700
      )
      this.cullCreaturesButton.draw()

      screenGraphics.pop()
    }
  }

  class CullCreaturesActivity extends Activity {
    private creatureGridView: CreatureGridView
    private popupSimulationView: PopupSimulationView
    private propagateCreaturesButton: PropagateCreaturesButton

    constructor(config: ActivityConfig) {
      super(config)

      const getCreatureAndGridIndexFn = (index: number) => {
        return {
          creature: this.appState.sortedCreatures[index],
          gridIndex: index
        }
      }

      this.creatureGridView = new CreatureGridView({
        appView: this.appView,
        getCreatureAndGridIndexFn
      })

      const widgetConfig = {
        appController: this.appController,
        appState: this.appState,
        appView: this.appView
      }

      const simulationWidgetConfig = {
        ...widgetConfig,
        simulationConfig,
        simulationState
      }

      this.popupSimulationView = new PopupSimulationView(simulationWidgetConfig)
      this.propagateCreaturesButton = new PropagateCreaturesButton(widgetConfig)
    }

    deinitialize(): void {
      this.creatureGridView.deinitialize()
      this.popupSimulationView.deinitialize()
    }

    draw(): void {
      const {canvas, height, screenGraphics, width} = this.appView
      const {creatureGridView} = this

      canvas.image(screenGraphics, 0, 0, width, height)

      const gridStartX = 25 // 40 minus horizontal grid margin
      const gridStartY = 28 // 40 minus vertical grid margin

      canvas.image(creatureGridView.graphics, gridStartX, gridStartY)

      /*
       * When the cursor is over any of the creature tiles, the popup simulation
       * will be displayed for the associated creature.
       */

      const gridIndex = creatureGridView.getGridIndexUnderCursor(40, 42)

      if (gridIndex != null) {
        this.appController.setPopupSimulationCreatureId(gridIndex)
        this.popupSimulationView.draw()
      } else {
        this.appController.clearPopupSimulation()
      }
    }

    initialize(): void {
      this.appController.cullCreatures()
      this.appState.viewTimer = 0

      this.drawInterface()
      this.creatureGridView.draw()
    }

    onMouseReleased(): void {
      if (this.propagateCreaturesButton.isUnderCursor()) {
        this.propagateCreaturesButton.onClick()
      }
    }

    private drawInterface(): void {
      const {canvas, font, screenGraphics, width} = this.appView

      screenGraphics.background(220, 253, 102)

      screenGraphics.push()
      screenGraphics.scale(1.5)

      screenGraphics.textAlign(canvas.CENTER)
      screenGraphics.textFont(font, 24)
      screenGraphics.fill(100, 100, 200)
      screenGraphics.noStroke()

      screenGraphics.fill(0)
      screenGraphics.text(
        'Faster creatures are more likely to survive because they can outrun their predators.  Slow creatures get eaten.',
        width / 2,
        30
      )
      screenGraphics.text(
        'Because of random chance, a few fast ones get eaten, while a few slow ones survive.',
        width / 2 - 130,
        700
      )
      this.propagateCreaturesButton.draw()

      screenGraphics.pop()
    }
  }

  class PropagateCreaturesActivity extends Activity {
    private creatureGridView: CreatureGridView
    private backButton: PropagatedCreaturesBackButton

    constructor(config: ActivityConfig) {
      super(config)

      const getCreatureAndGridIndexFn = (index: number) => {
        let creature = this.appState.sortedCreatures[index]
        const latestIndex = creatureIdToIndex(creature.id)
        creature = this.appState.creaturesInLatestGeneration[latestIndex]

        return {creature, gridIndex: index}
      }

      this.creatureGridView = new CreatureGridView({
        appView: this.appView,
        getCreatureAndGridIndexFn
      })

      this.backButton = new PropagatedCreaturesBackButton({
        appController: this.appController,
        appState: this.appState,
        appView: this.appView
      })
    }

    deinitialize(): void {
      this.creatureGridView.deinitialize()
    }

    initialize(): void {
      this.appController.propagateCreatures()
      this.appState.viewTimer = 0

      this.drawInterface()
      this.drawCreatureGrid()
    }

    onMouseReleased(): void {
      if (this.backButton.isUnderCursor()) {
        this.backButton.onClick()
      }
    }

    private drawCreatureGrid(): void {
      const {canvas} = this.appView

      this.creatureGridView.draw()

      const gridStartX = 25 // 40 minus horizontal grid margin
      const gridStartY = 28 // 40 minus vertical grid margin

      canvas.image(this.creatureGridView.graphics, gridStartX, gridStartY)
    }

    private drawInterface(): void {
      const {appState, appView} = this
      const {canvas, font, height, screenGraphics, width} = appView

      screenGraphics.background(220, 253, 102)

      screenGraphics.push()
      screenGraphics.scale(1.5)

      screenGraphics.textAlign(canvas.CENTER)
      screenGraphics.textFont(font, 24)
      screenGraphics.fill(100, 100, 200)
      screenGraphics.noStroke()

      screenGraphics.fill(0)
      screenGraphics.text(
        'These are the 1000 creatures of generation #' +
          (appState.generationCount + 1) +
          '.',
        width / 2,
        30
      )
      screenGraphics.text(
        'What perils will they face?  Find out next time!',
        width / 2 - 130,
        700
      )
      this.backButton.draw()

      screenGraphics.pop()

      canvas.image(screenGraphics, 0, 0, width, height)
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
  }

  p5.draw = () => {
    p5.scale(appView.scale)

    const {currentActivityId, nextActivityId} = appState

    if (nextActivityId !== currentActivityId) {
      appState.currentActivity.deinitialize()

      const ActivityClass = activityClassByActivityId[nextActivityId]
      appState.currentActivity = new ActivityClass({
        appController,
        appState,
        appView
      })
      appState.currentActivityId = nextActivityId

      appState.currentActivity.initialize()
    }

    appState.currentActivity.draw()
  }
}
