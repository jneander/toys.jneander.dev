import type p5 from 'p5'
import type {Font} from 'p5'

import {P5Wrapper} from '../../../p5-utils'
import type {CreatureInfoP5View} from './p5-view'

export interface CreateUiFnParameters {
  p5Wrapper: P5Wrapper
}

export interface CreateSketchFnConfig {
  createUiFn(parameters: CreateUiFnParameters): CreatureInfoP5View
}

let font: Font

export function createSketchFn({createUiFn}: CreateSketchFnConfig) {
  return function sketch(p5: p5) {
    const FRAME_RATE = 60 // target frames per second

    let currentUI: CreatureInfoP5View
    let p5Wrapper: P5Wrapper

    if (font == null) {
      p5.preload = () => {
        font = p5.loadFont('/fonts/Helvetica-Bold.otf')
      }
    }

    p5.setup = () => {
      p5.frameRate(FRAME_RATE)

      p5Wrapper = new P5Wrapper({
        font,
        height: 240,
        p5,
        scale: 1,
        width: 240
      })
    }

    p5.draw = () => {
      if (currentUI == null) {
        currentUI = createUiFn({p5Wrapper})
      }

      currentUI.draw()
    }
  }
}
