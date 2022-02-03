import type p5 from 'p5'

import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {SortingCreaturesP5View} from './p5-view'
import {createSketchFn, CreateUiFnParameters} from './sketch'

export interface ViewControllerConfig {
  activityController: ActivityController
  appStore: AppStore
}

export class ViewController {
  private container: HTMLElement | null
  private p5Instance: p5 | null

  private activityController: ActivityController
  private appStore: AppStore

  constructor(config: ViewControllerConfig) {
    this.activityController = config.activityController
    this.appStore = config.appStore

    this.container = null
    this.p5Instance = null
  }

  async initialize(container: HTMLElement) {
    this.container = container

    const p5 = (await import('p5')).default

    if (this.container != null) {
      const createUiFn = ({p5Wrapper}: CreateUiFnParameters) => {
        return new SortingCreaturesP5View({
          activityController: this.activityController,
          appStore: this.appStore,
          p5Wrapper
        })
      }

      const sketchFn = createSketchFn({createUiFn})
      this.p5Instance = new p5(sketchFn, this.container)
    }
  }

  deinitialize() {
    this.p5Instance?.remove()
    this.container = null
  }
}
