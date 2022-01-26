import type p5 from 'p5'
import type {Font} from 'p5'

import {P5ActivityInterface} from './activities'
import {P5Wrapper} from './p5-utils'

export interface CreateActivityFnParameters {
  p5Wrapper: P5Wrapper
}

export interface CreateSketchFnConfig {
  createActivityFn(parameters: CreateActivityFnParameters): P5ActivityInterface
}

let font: Font

export function createSketchFn({createActivityFn}: CreateSketchFnConfig) {
  return function sketch(p5: p5) {
    const FRAME_RATE = 60 // target frames per second

    let currentActivity: P5ActivityInterface

    let p5Wrapper: P5Wrapper

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

      p5Wrapper = new P5Wrapper({
        font,
        height: 720,
        p5,
        scale: 0.8,
        width: 1280
      })
    }

    p5.draw = () => {
      p5.scale(p5Wrapper.scale)

      if (currentActivity == null) {
        currentActivity = createActivityFn({p5Wrapper})
        currentActivity.initialize()
      }

      currentActivity.draw()
    }
  }
}
