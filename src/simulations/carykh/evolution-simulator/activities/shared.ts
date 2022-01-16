import type {AppController} from '../app-controller'

export interface ActivityConfig {
  appController: AppController
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

  constructor(config: ActivityConfig) {
    this.appController = config.appController
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
