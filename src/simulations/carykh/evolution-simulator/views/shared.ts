import type {AppView} from './app-view'

export interface WidgetConfig {
  appView: AppView
}

export abstract class Widget {
  protected appView: AppView

  constructor(config: WidgetConfig) {
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
