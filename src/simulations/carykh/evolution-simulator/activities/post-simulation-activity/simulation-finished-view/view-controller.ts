import type p5 from 'p5'

import type {AppController} from '../../../app-controller'
import type {AppStore} from '../../../types'
import {CreatureGridP5UI} from './creature-grid-p5-ui'
import type {CreatureGridViewConfig} from './p5-view'
import {createSketchFn, CreateUiFnParameters} from './sketch'

export interface ViewControllerConfig {
  appController: AppController
  appStore: AppStore
  getCreatureAndGridIndexFn: CreatureGridViewConfig['getCreatureAndGridIndexFn']
}

export class ViewController {
  private container: HTMLElement | null
  private p5Instance: p5 | null

  private appController: AppController
  private appStore: AppStore
  private getCreatureAndGridIndexFn: CreatureGridViewConfig['getCreatureAndGridIndexFn']

  constructor(config: ViewControllerConfig) {
    this.appController = config.appController
    this.appStore = config.appStore
    this.getCreatureAndGridIndexFn = config.getCreatureAndGridIndexFn

    this.container = null
    this.p5Instance = null
  }

  async initialize(container: HTMLElement) {
    this.container = container

    const p5 = (await import('p5')).default

    if (this.container != null) {
      const createUiFn = ({p5Wrapper}: CreateUiFnParameters) => {
        return new CreatureGridP5UI({
          appController: this.appController,
          appStore: this.appStore,
          getCreatureAndGridIndexFn: this.getCreatureAndGridIndexFn,
          gridStartX: 40,
          gridStartY: 42,
          p5Wrapper,
          showsPopupSimulation: () => true
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
