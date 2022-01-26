import type {AppController} from '../app-controller'
import type {AppStore} from '../types'
import type {P5Wrapper} from '../views'

export interface ActivityConfig {
  appController: AppController
  appStore: AppStore
  p5Wrapper: P5Wrapper
}

export interface ActivityInterface {
  initialize(): void
  draw(): void
  onMousePressed(): void
  onMouseReleased(): void
  onMouseWheel(event: WheelEvent): void
}

export abstract class Activity implements ActivityInterface {
  protected appController: AppController
  protected appStore: AppStore
  protected p5Wrapper: P5Wrapper

  constructor(config: ActivityConfig) {
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
