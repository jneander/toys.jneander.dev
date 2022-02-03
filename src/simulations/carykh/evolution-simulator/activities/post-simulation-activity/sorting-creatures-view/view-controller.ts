import {TimerSync} from '@jneander/utils-async'
import type p5 from 'p5'
import type {Font} from 'p5'

import {P5Wrapper} from '../../../p5-utils'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {SortingCreaturesP5View} from './p5-view'

export interface ViewControllerConfig {
  activityController: ActivityController
  appStore: AppStore
}

let font: Font

export class ViewController {
  private container: HTMLElement | null
  private p5Instance: p5 | null
  private p5View: SortingCreaturesP5View | null
  private p5Wrapper: P5Wrapper | null

  private activityController: ActivityController
  private appStore: AppStore

  private timer: TimerSync

  constructor(config: ViewControllerConfig) {
    this.activityController = config.activityController
    this.appStore = config.appStore

    this.container = null
    this.p5Instance = null
    this.p5View = null
    this.p5Wrapper = null

    this.timer = new TimerSync({
      onTick: this.draw.bind(this),
      targetTickIntervalMs: 16
    })
  }

  async initialize(container: HTMLElement) {
    this.container = container

    const p5 = (await import('p5')).default

    if (this.container != null) {
      this.p5Instance = new p5(this.sketch.bind(this), this.container)
      this.timer.start()
    }
  }

  deinitialize() {
    this.timer.stop()
    this.p5Instance?.remove()
    this.container = null
  }

  private sketch(p5: p5): void {
    if (font == null) {
      p5.preload = () => {
        font = p5.loadFont('/fonts/Helvetica-Bold.otf')
      }
    }

    p5.setup = () => {
      this.p5Wrapper = new P5Wrapper({
        font,
        height: 720,
        p5,
        scale: 0.8,
        width: 1280
      })
    }
  }

  private draw(): void {
    if (this.p5Wrapper == null) {
      return
    }

    if (this.p5View == null) {
      this.p5View = new SortingCreaturesP5View({
        activityController: this.activityController,
        appStore: this.appStore,
        p5Wrapper: this.p5Wrapper
      })
    }

    this.p5View.draw()
  }
}
