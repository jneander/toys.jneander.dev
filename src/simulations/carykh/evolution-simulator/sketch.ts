import type p5 from 'p5'
import type {Font} from 'p5'

import Creature from './Creature'
import {
  CullCreaturesActivity,
  GenerateCreaturesActivity,
  GenerationViewActivity,
  NullActivity,
  PropagateCreaturesActivity,
  SimulationFinishedActivity,
  SimulationRunningActivity,
  SortedCreaturesActivity,
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
import type {SimulationConfig} from './simulation'
import type {AppState, SimulationState} from './types'
import {AppView} from './views'

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
    selectedGeneration: 0,
    sortedCreatures: [],
    speciesCountsHistoryMap: {},
    statusWindow: -4
  }

  const simulationConfig: SimulationConfig = {
    hazelStairs: -1,
    randomFractFn: (minInclusive: number, maxExclusive: number) =>
      p5.random(minInclusive, maxExclusive)
  }

  const simulationState: SimulationState = {
    creature: {
      id: 0,
      muscles: [],
      nodeCaches: [],
      nodes: []
    },

    speed: 1,
    timer: 0
  }

  const appController = new AppController({
    appState,
    randomFractFn: (minInclusive: number, maxExclusive: number) =>
      p5.random(minInclusive, maxExclusive),
    simulationConfig,
    simulationState
  })

  let appView: AppView

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
