import type p5 from 'p5'
import type {Font} from 'p5'

import {
  CullCreaturesP5Activity,
  GenerateCreaturesP5Activity,
  GenerationViewP5Activity,
  NullP5Activity,
  PropagateCreaturesP5Activity,
  SimulationFinishedP5Activity,
  SimulationRunningP5Activity,
  SortedCreaturesP5Activity,
  SortingCreaturesP5Activity
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

    let currentActivity = new NullP5Activity()

    let appView: AppView
    let font: Font

    const activityClassByActivityId = {
      [ActivityId.Start]: NullP5Activity,
      [ActivityId.GenerationView]: GenerationViewP5Activity,
      [ActivityId.GenerateCreatures]: GenerateCreaturesP5Activity,
      [ActivityId.SimulationRunning]: SimulationRunningP5Activity,
      [ActivityId.SimulationFinished]: SimulationFinishedP5Activity,
      [ActivityId.SortingCreatures]: SortingCreaturesP5Activity,
      [ActivityId.SortedCreatures]: SortedCreaturesP5Activity,
      [ActivityId.CullCreatures]: CullCreaturesP5Activity,
      [ActivityId.PropagateCreatures]: PropagateCreaturesP5Activity
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

      const {currentActivityId} = appStore.getState()

      if (currentActivity instanceof NullP5Activity) {
        const ActivityClass = activityClassByActivityId[currentActivityId]
        currentActivity = new ActivityClass({
          appController,
          appStore,
          appView
        })

        currentActivity.initialize()
      }

      currentActivity.draw()
    }
  }
}
