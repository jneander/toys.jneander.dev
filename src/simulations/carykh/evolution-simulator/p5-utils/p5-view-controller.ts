import type {Font} from 'p5'
import p5 from 'p5'

import {P5Wrapper} from './p5-wrapper'
import type {P5CanvasContainer, P5ViewAdapter} from './types'

let font: Font

export class P5ViewController implements P5CanvasContainer {
  private container: HTMLElement
  private measurer: HTMLElement

  private adapter?: P5ViewAdapter
  private instance?: p5
  private resizeObserver?: ResizeObserver

  constructor(container: HTMLElement) {
    this.container = container

    this.measurer = this.container.appendChild(document.createElement('div'))
    this.measurer.setAttribute('data-id', 'measuring')
    this.measurer.style.maxWidth = '100%'
  }

  initialize(): void {
    this.instance?.remove()
    this.instance = new p5(this.sketch.bind(this), this.container)

    let lastContainerWidth: number

    this.resizeObserver = new ResizeObserver(entries => {
      const containerWidth = entries.at(0)?.borderBoxSize?.at(0)?.inlineSize

      if (containerWidth == null) {
        return
      }

      if (lastContainerWidth !== containerWidth) {
        this.adapter?.onContainerWidthChanged?.(containerWidth)
      }

      lastContainerWidth = containerWidth
    })

    this.resizeObserver.observe(this.measurer)
  }

  deinitialize(): void {
    this.resizeObserver?.disconnect()
    delete this.resizeObserver

    this.instance?.remove()
    delete this.instance
  }

  getAvailableWidth(): number {
    return this.measurer.clientWidth
  }

  setAdapter(adapter: P5ViewAdapter): void {
    this.adapter?.deinitialize()
    this.adapter = adapter
  }

  private sketch(p5: p5): void {
    const FRAME_RATE = 60 // target frames per second

    let currentAdapter: P5ViewAdapter | undefined
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
        currentAdapter?.initialize(p5Wrapper, this)
      }

      currentAdapter?.draw?.()
    }
  }
}
