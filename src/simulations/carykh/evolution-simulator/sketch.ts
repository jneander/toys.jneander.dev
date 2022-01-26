import type p5 from 'p5'
import type {Font} from 'p5'

import {ActivityInterface} from './activities'
import {AppView} from './views'

export interface CreateActivityFnParameters {
  appView: AppView
}

export interface CreateSketchFnConfig {
  createActivityFn(parameters: CreateActivityFnParameters): ActivityInterface
}

let font: Font

export function createSketchFn({createActivityFn}: CreateSketchFnConfig) {
  return function sketch(p5: p5) {
    const FRAME_RATE = 60 // target frames per second

    let currentActivity: ActivityInterface

    let appView: AppView

    p5.mouseWheel = (event: WheelEvent) => {
      currentActivity.onMouseWheel(event)
    }

    p5.mousePressed = () => {
      currentActivity.onMousePressed()
    }

    p5.mouseReleased = () => {
      currentActivity.onMouseReleased()
    }

    if (font == null) {
      p5.preload = () => {
        font = p5.loadFont('/fonts/Helvetica-Bold.otf')
      }
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

      if (currentActivity == null) {
        currentActivity = createActivityFn({appView})
        currentActivity.initialize()
      }

      currentActivity.draw()
    }
  }
}
