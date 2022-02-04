import {TimerSync} from '@jneander/utils-async'
import type p5 from 'p5'
import type {Font} from 'p5'

import {P5Wrapper} from '../../../p5-utils'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {ActivityStep} from '../constants'
import {SortingCreaturesP5View} from './p5-view'

export interface ViewControllerConfig {
  activityController: ActivityController
  appStore: AppStore
}

let font: Font

export class ViewController {
  private p5View: SortingCreaturesP5View | null
  private p5Wrapper: P5Wrapper | null

  private activityController: ActivityController
  private appStore: AppStore

  private timer: TimerSync

  constructor(config: ViewControllerConfig) {
    this.activityController = config.activityController
    this.appStore = config.appStore

    this.p5View = null
    this.p5Wrapper = null

    this.timer = new TimerSync({
      onTick: this.draw.bind(this),
      targetTickIntervalMs: 16
    })

    this.sketch = this.sketch.bind(this)
  }

  sketch(p5: p5): void {
    let startedTimer = false

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

    p5.draw = () => {
      if (!startedTimer) {
        this.timer.start()
        startedTimer = true
      }
    }
  }

  private draw(): void {
    if (this.p5Wrapper == null) {
      return
    }

    if (this.p5View == null) {
      const onAnimationFinished = () => {
        this.activityController.setCurrentActivityStep(
          ActivityStep.SortedCreatures
        )
      }

      this.p5View = new SortingCreaturesP5View({
        appStore: this.appStore,
        onAnimationFinished,
        p5Wrapper: this.p5Wrapper
      })
    }

    this.p5View.draw()
  }
}
