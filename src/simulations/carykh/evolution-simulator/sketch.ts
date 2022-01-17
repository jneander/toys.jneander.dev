import type p5 from 'p5'
import type {Font} from 'p5'

import Creature from './Creature'
import Simulation from './Simulation'
import {
  Activity,
  ActivityConfig,
  GenerateCreaturesActivity,
  GenerationViewActivity,
  NullActivity,
  SimulationFinishedActivity,
  SimulationRunningActivity,
  SortingCreaturesActivity,
  StartActivity
} from './activities'
import {AppController} from './app-controller'
import {
  ActivityId,
  CREATURE_COUNT,
  FITNESS_PERCENTILE_CREATURE_INDICES,
  GenerationSimulationMode,
  HISTOGRAM_BAR_SPAN
} from './constants'
import {creatureIdToIndex} from './helpers'
import type {AppState, SimulationConfig, SimulationState} from './types'
import {AppView, CreatureGridView, PopupSimulationView, Widget} from './views'

export default function sketch(p5: p5) {
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
        simulationConfig: this.simulationConfig,
        simulationState: this.simulationState
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
        simulationConfig: this.simulationConfig,
        simulationState: this.simulationState
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
        appView,
        simulationConfig,
        simulationState
      })
      appState.currentActivityId = nextActivityId

      appState.currentActivity.initialize()
    }

    appState.currentActivity.draw()
  }
}
