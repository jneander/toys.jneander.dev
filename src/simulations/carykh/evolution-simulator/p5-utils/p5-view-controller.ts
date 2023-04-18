import type p5 from 'p5'
import type {Font} from 'p5'

import {P5Wrapper} from './p5-wrapper'
import type {P5ViewAdapter} from './types'

let font: Font

export interface P5ViewControllerConfig {
  height: number
  width: number
}

export class P5ViewController {
  private config: P5ViewControllerConfig
  private adapter: P5ViewAdapter | null

  constructor(config: Partial<P5ViewControllerConfig> = {}) {
    const {height = 576, width = 1024} = config
    this.config = {height, width}

    this.adapter = null

    this.sketch = this.sketch.bind(this)
  }

  setAdapter(adapter: P5ViewAdapter | null): void {
    this.adapter?.deinitialize()
    this.adapter = adapter
  }

  sketch(p5: p5): void {
    const FRAME_RATE = 60 // target frames per second

    let currentAdapter: P5ViewAdapter | null
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

      const {height, width} = this.config

      p5Wrapper = new P5Wrapper({
        font,
        height,
        p5,
        width,
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
