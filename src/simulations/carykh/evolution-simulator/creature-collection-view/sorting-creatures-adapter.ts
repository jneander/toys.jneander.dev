import type {P5ClientViewAdapter, P5Wrapper} from '../p5-utils'
import type {AppStore} from '../types'
import {SortingCreaturesP5View} from './sorting-creatures-p5-view'

export interface SortingCreaturesAdapterConfig {
  appStore: AppStore
  onAnimationFinished: () => void
}

export class SortingCreaturesAdapter implements P5ClientViewAdapter {
  private config: SortingCreaturesAdapterConfig

  private sortingCreaturesP5Ui: SortingCreaturesP5View | null

  constructor(config: SortingCreaturesAdapterConfig) {
    this.config = config

    this.sortingCreaturesP5Ui = null
  }

  initialize(p5Wrapper: P5Wrapper): void {
    this.sortingCreaturesP5Ui = new SortingCreaturesP5View({
      appStore: this.config.appStore,
      onAnimationFinished: this.config.onAnimationFinished,
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
