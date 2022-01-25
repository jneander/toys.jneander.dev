import type {AppController} from '../app-controller'
import type {AppStore} from '../types'
import type {AppView} from '../views'

export interface ActivityConfig {
  appController: AppController
  appStore: AppStore
  appView: AppView
}

export interface ActivityInterface {
  initialize(): void
  deinitialize(): void
  draw(): void
  onMousePressed(): void
  onMouseReleased(): void
  onMouseWheel(event: WheelEvent): void
}

export abstract class Activity implements ActivityInterface {
  protected appController: AppController
  protected appStore: AppStore
  protected appView: AppView

  constructor(config: ActivityConfig) {
    this.appController = config.appController
    this.appStore = config.appStore
    this.appView = config.appView
  }

  initialize(): void {}
  deinitialize(): void {}
  draw(): void {}
  onMousePressed(): void {}
  onMouseReleased(): void {}
  onMouseWheel(event: WheelEvent): void {}
}

export class NullP5Activity implements ActivityInterface {
  initialize(): void {}
  deinitialize(): void {}
  draw(): void {}
  onMousePressed(): void {}
  onMouseReleased(): void {}
  onMouseWheel(event: WheelEvent): void {}
}
