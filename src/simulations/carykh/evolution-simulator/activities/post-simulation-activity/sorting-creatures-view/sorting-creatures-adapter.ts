import type {P5ClientViewAdapter, P5Wrapper} from '../../../p5-utils'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {ActivityStep} from '../constants'
import {SortingCreaturesP5View} from './p5-view'

export interface SortingCreaturesAdapterConfig {
  activityController: ActivityController
  appStore: AppStore
}

export class SortingCreaturesAdapter implements P5ClientViewAdapter {
  private activityController: ActivityController
  private appStore: AppStore

  private sortingCreaturesP5Ui: SortingCreaturesP5View | null

  constructor(config: SortingCreaturesAdapterConfig) {
    this.activityController = config.activityController
    this.appStore = config.appStore

    this.sortingCreaturesP5Ui = null
  }

  initialize(p5Wrapper: P5Wrapper): void {
    const onAnimationFinished = () => {
      this.activityController.setCurrentActivityStep(
        ActivityStep.SortedCreatures
      )
    }

    this.sortingCreaturesP5Ui = new SortingCreaturesP5View({
      appStore: this.appStore,
      onAnimationFinished,
      p5Wrapper
    })
  }

  deinitialize(): void {
    this.sortingCreaturesP5Ui = null
  }

  draw(): void {
    this.sortingCreaturesP5Ui?.draw()
  }
}
