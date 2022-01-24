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
import type {AppController} from './app-controller'
import {ActivityId} from './constants'
import type {AppStore} from './types'
import {AppView} from './views'

export interface CreateSketchFnConfig {
  appController: AppController
  appStore: AppStore
}

export function createSketchFn({
  appController,
  appStore
}: CreateSketchFnConfig) {
  return function sketch(p5: p5) {
    const FRAME_RATE = 60 // target frames per second

    let currentActivity = new NullActivity()

    let appView: AppView
    let font: Font

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
      currentActivity.onMouseWheel(event)
    }

    p5.mousePressed = () => {
      currentActivity.onMousePressed()
    }

    p5.mouseReleased = () => {
      currentActivity.onMouseReleased()
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

      const {currentActivityId, nextActivityId} = appStore.getState()

      if (nextActivityId !== currentActivityId) {
        currentActivity.deinitialize()

        const ActivityClass = activityClassByActivityId[nextActivityId]
        currentActivity = new ActivityClass({
          appController,
          appStore,
          appView
        })

        appStore.setState({currentActivityId: nextActivityId})

        currentActivity.initialize()
      }

      currentActivity.draw()
    }
  }
}
