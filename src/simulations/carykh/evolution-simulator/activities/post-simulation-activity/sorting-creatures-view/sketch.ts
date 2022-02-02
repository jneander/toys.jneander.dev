import type p5 from 'p5'
import type {Font} from 'p5'

import {P5Wrapper} from '../../../p5-utils'
import type {SortingCreaturesP5View} from './p5-view'

export interface CreateUiFnParameters {
  p5Wrapper: P5Wrapper
}

export interface CreateSketchFnConfig {
  createUiFn(parameters: CreateUiFnParameters): SortingCreaturesP5View
}

let font: Font

export function createSketchFn({createUiFn}: CreateSketchFnConfig) {
  return function sketch(p5: p5) {
    const FRAME_RATE = 60 // target frames per second

    let currentUI: SortingCreaturesP5View

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
        height: 720,
        p5,
        scale: 0.8,
        width: 1280
      })
    }

    p5.draw = () => {
      p5.scale(p5Wrapper.scale)

      if (currentUI == null) {
        currentUI = createUiFn({p5Wrapper})
      }

      currentUI.draw()
    }
  }
}
