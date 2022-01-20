import type {AppController} from '../app-controller'
import type {AppState} from '../types'
import type {AppView} from './app-view'

export interface WidgetConfig {
  appController: AppController
  appState: AppState
  appView: AppView
}

export abstract class Widget {
  protected appController: AppController
  protected appState: AppState
  protected appView: AppView

  constructor(config: WidgetConfig) {
    this.appController = config.appController
    this.appState = config.appState
    this.appView = config.appView
  }

  abstract draw(): void
}

export interface ButtonWidgetConfig extends WidgetConfig {
  onClick(): void
}

export abstract class ButtonWidget extends Widget {
  onClick: () => void

  constructor(config: ButtonWidgetConfig) {
    super(config)

    this.onClick = config.onClick
  }
}
