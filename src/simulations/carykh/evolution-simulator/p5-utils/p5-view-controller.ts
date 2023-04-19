import type {Font} from 'p5'
import p5 from 'p5'

import {P5Wrapper} from './p5-wrapper'
import type {P5ViewAdapter} from './types'

let font: Font

export class P5ViewController {
  private adapter: P5ViewAdapter
  private container: HTMLElement
  private instance?: p5

  constructor(adapter: P5ViewAdapter, container: HTMLElement) {
    this.adapter = adapter
    this.container = container
  }

  initialize(): void {
    this.instance?.remove()
    this.instance = new p5(this.sketch.bind(this), this.container)
  }

  deinitialize(): void {
    this.instance?.remove()
  }

  setAdapter(adapter: P5ViewAdapter): void {
    this.adapter.deinitialize()
    this.adapter = adapter
  }

  private sketch(p5: p5): void {
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

      p5Wrapper = new P5Wrapper({
        font,
        p5,
      })
    }

    p5.draw = () => {
      p5.scale(p5Wrapper.scale)

      if (currentAdapter !== this.adapter) {
        currentAdapter = this.adapter
        currentAdapter.initialize(p5Wrapper)
      }

      currentAdapter.draw?.()
    }
  }
}
