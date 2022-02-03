import type p5 from 'p5'
import type {Font} from 'p5'

import type {AppController} from '../../../app-controller'
import {P5Wrapper} from '../../../p5-utils'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {CreatureGridP5UI} from './creature-grid-p5-ui'

export interface ViewControllerConfig {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

let font: Font

export class ViewController {
  private container: HTMLElement | null
  private p5Instance: p5 | null

  private activityController: ActivityController
  private appController: AppController
  private appStore: AppStore

  constructor(config: ViewControllerConfig) {
    this.activityController = config.activityController
    this.appController = config.appController
    this.appStore = config.appStore

    this.container = null
    this.p5Instance = null
  }

  async initialize(container: HTMLElement) {
    this.container = container

    const p5 = (await import('p5')).default

    if (this.container != null) {
      this.p5Instance = new p5(this.sketch.bind(this), this.container)
    }
  }

  deinitialize() {
    this.p5Instance?.remove()
    this.container = null
  }

  private sketch(p5: p5): void {
    const FRAME_RATE = 60 // target frames per second

    let currentUI: CreatureGridP5UI
    let p5Wrapper: P5Wrapper

    p5.mouseReleased = () => {
      currentUI.onMouseReleased()
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

      if (currentUI == null) {
        const getCreatureAndGridIndexFn = (index: number) => {
          return this.activityController.getCreatureAndGridIndex(index)
        }

        currentUI = new CreatureGridP5UI({
          appController: this.appController,
          appStore: this.appStore,
          getCreatureAndGridIndexFn,
          gridStartX: 40,
          gridStartY: 42,
          p5Wrapper,
          showsPopupSimulation: () => true
        })

        currentUI.initialize()
      }

      currentUI.draw()
    }
  }
}
