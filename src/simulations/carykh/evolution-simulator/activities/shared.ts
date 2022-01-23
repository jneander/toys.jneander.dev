import type {AppController} from '../app-controller'
import type {AppState} from '../types'
import type {AppView} from '../views'

export interface ActivityConfig {
  appController: AppController
  appState: AppState
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
  protected appState: AppState
  protected appView: AppView

  constructor(config: ActivityConfig) {
    this.appController = config.appController
    this.appState = config.appState
    this.appView = config.appView
  }

  initialize(): void {}
  deinitialize(): void {}
  draw(): void {}
  onMousePressed(): void {}
  onMouseReleased(): void {}
  onMouseWheel(event: WheelEvent): void {}
}

export class NullActivity implements ActivityInterface {
  initialize(): void {}
  deinitialize(): void {}
  draw(): void {}
  onMousePressed(): void {}
  onMouseReleased(): void {}
  onMouseWheel(event: WheelEvent): void {}
}
