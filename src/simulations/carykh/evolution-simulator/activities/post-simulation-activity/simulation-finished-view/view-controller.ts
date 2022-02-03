import type p5 from 'p5'
import type {Font} from 'p5'

import {P5Wrapper} from '../../../p5-utils'
import type {P5ClientViewAdapter} from './types'

let font: Font

export class ViewController {
  private adapter: P5ClientViewAdapter | null

  constructor() {
    this.adapter = null

    this.sketch = this.sketch.bind(this)
  }

  setAdapter(adapter: P5ClientViewAdapter | null): void {
    this.adapter?.deinitialize()
    this.adapter = adapter
  }

  sketch(p5: p5): void {
    const FRAME_RATE = 60 // target frames per second

    let currentAdapter: P5ClientViewAdapter | null
    let p5Wrapper: P5Wrapper

    p5.mousePressed = () => {
      currentAdapter?.onMousePressed?.()
    }

    p5.mouseReleased = () => {
      currentAdapter?.onMouseReleased?.()
    }

    p5.mouseWheel = (event: WheelEvent) => {
      currentAdapter?.onMouseWheel?.(event)
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

      if (currentAdapter !== this.adapter) {
        currentAdapter = this.adapter
        currentAdapter?.initialize(p5Wrapper)
      }

      currentAdapter?.draw?.()
    }
  }
}
