import type {AppController} from '../app-controller'
import type {SimulationConfig} from '../simulation'
import type {AppState} from '../types'
import type {AppView} from '../views'

export interface ActivityConfig {
  appController: AppController
  appState: AppState
  appView: AppView
  simulationConfig: SimulationConfig
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
  protected simulationConfig: SimulationConfig

  constructor(config: ActivityConfig) {
    this.appController = config.appController
    this.appState = config.appState
    this.appView = config.appView
    this.simulationConfig = config.simulationConfig
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
