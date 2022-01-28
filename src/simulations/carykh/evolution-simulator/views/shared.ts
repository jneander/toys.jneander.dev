import type {P5Wrapper} from '../p5-utils'

export interface WidgetConfig {
  p5Wrapper: P5Wrapper
}

export abstract class Widget {
  protected p5Wrapper: P5Wrapper

  constructor(config: WidgetConfig) {
    this.p5Wrapper = config.p5Wrapper
  }

  abstract draw(): void
}
