import type {AppController} from '../app-controller'
import type {P5Wrapper} from '../p5-utils'
import type {AppStore} from '../types'

export interface P5ActivityConfig {
  appController: AppController
  appStore: AppStore
  p5Wrapper: P5Wrapper
}

export interface P5UI {
  initialize(): void
  draw(): void
  onMousePressed(): void
  onMouseReleased(): void
  onMouseWheel(event: WheelEvent): void
}

export abstract class P5Activity implements P5UI {
  protected appController: AppController
  protected appStore: AppStore
  protected p5Wrapper: P5Wrapper

  constructor(config: P5ActivityConfig) {
    this.appController = config.appController
    this.appStore = config.appStore
    this.p5Wrapper = config.p5Wrapper
  }

  initialize(): void {}
  draw(): void {}
  onMousePressed(): void {}
  onMouseReleased(): void {}
  onMouseWheel(event: WheelEvent): void {}
}
