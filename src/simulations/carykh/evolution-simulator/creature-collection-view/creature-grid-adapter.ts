import type {AppController} from '../app-controller'
import type {P5ViewAdapter, P5ViewDimensions, P5Wrapper} from '../p5-utils'
import type {AppStore} from '../types'
import {CreatureGridP5Ui} from './creature-grid-p5-ui'
import type {CreatureAndGridIndex} from './types'

export interface CreatureGridAdapterConfig {
  appController: AppController
  appStore: AppStore
  getCreatureAndGridIndexFn: (index: number) => CreatureAndGridIndex
  showsPopupSimulation: () => boolean
}

export class CreatureGridAdapter implements P5ViewAdapter {
  private config: CreatureGridAdapterConfig

  private creatureGridP5Ui: CreatureGridP5Ui | null

  constructor(config: CreatureGridAdapterConfig) {
    this.config = config

    this.creatureGridP5Ui = null
  }

  get dimensions(): P5ViewDimensions {
    return {
      height: 664,
      width: 1024,
    }
  }

  initialize(p5Wrapper: P5Wrapper): void {
    this.creatureGridP5Ui = new CreatureGridP5Ui({
      appController: this.config.appController,
      appStore: this.config.appStore,
      dimensions: this.dimensions,
      getCreatureAndGridIndexFn: this.config.getCreatureAndGridIndexFn,
      p5Wrapper,
      showsPopupSimulation: this.config.showsPopupSimulation,
    })

    this.creatureGridP5Ui.initialize()
  }

  deinitialize(): void {
    this.creatureGridP5Ui = null
  }

  draw(): void {
    this.creatureGridP5Ui?.draw()
  }

  onMouseReleased() {
    this.creatureGridP5Ui?.onMouseReleased()
  }
}
