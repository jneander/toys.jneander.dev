import {AleaNumberGenerator} from '@jneander/utils-random'
import type p5 from 'p5'
import type {Font} from 'p5'

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
import {ActivityId} from './constants'
import type {SimulationConfig} from './simulation'
import type {AppState} from './types'
import {AppView} from './views'

export default function sketch(p5: p5) {
  const FRAME_RATE = 60 // target frames per second
  const SEED = 0

  const randomNumberGenerator = new AleaNumberGenerator({seed: SEED})

  let font: Font

  const appState: AppState = {
    creaturesInLatestGeneration: [],
    currentActivity: new NullActivity(),
    currentActivityId: null,
    generationCount: -1,
    generationHistoryMap: {},
    nextActivityId: ActivityId.Start,
    selectedGeneration: 0
  }

  const simulationConfig: SimulationConfig = {
    hazelStairs: -1
  }

  const appController = new AppController({
    appState,
    randomNumberGenerator,
    simulationConfig
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
  }

  p5.mouseReleased = () => {
    appState.currentActivity.onMouseReleased()
  }

  p5.preload = () => {
    font = p5.loadFont('/fonts/Helvetica-Bold.otf')
  }

  p5.setup = () => {
    p5.frameRate(FRAME_RATE)

    appView = new AppView({
      font,
      height: 720,
      p5,
      scale: 0.8,
      width: 1280
    })
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
