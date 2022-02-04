import type {AppController} from '../../../app-controller'
import type {P5ClientViewAdapter, P5Wrapper} from '../../../p5-utils'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {CreatureGridP5UI} from './creature-grid-p5-ui'

export interface CreatureGridAdapterConfig {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export class CreatureGridAdapter implements P5ClientViewAdapter {
  private activityController: ActivityController
  private appController: AppController
  private appStore: AppStore

  private creatureGridP5Ui: CreatureGridP5UI | null

  constructor(config: CreatureGridAdapterConfig) {
    this.activityController = config.activityController
    this.appController = config.appController
    this.appStore = config.appStore

    this.creatureGridP5Ui = null
  }

  initialize(p5Wrapper: P5Wrapper): void {
    const getCreatureAndGridIndexFn = (index: number) => {
      return this.activityController.getCreatureAndGridIndex(index)
    }

    this.creatureGridP5Ui = new CreatureGridP5UI({
      appController: this.appController,
      appStore: this.appStore,
      getCreatureAndGridIndexFn,
      gridStartX: 40,
      gridStartY: 42,
      p5Wrapper,
      showsPopupSimulation: () =>
        this.activityController.currentStepShowsPopupSimulation()
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
