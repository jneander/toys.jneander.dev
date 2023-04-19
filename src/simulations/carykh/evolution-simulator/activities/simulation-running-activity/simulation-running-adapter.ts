import type {AppController} from '../../app-controller'
import type {P5ViewAdapter, P5ViewDimensions, P5Wrapper} from '../../p5-utils'
import type {ActivityController} from './activity-controller'
import {SimulationRunningP5Ui} from './simulation-running-p5-ui'

export interface SimulationRunningAdapterConfig {
  activityController: ActivityController
  appController: AppController
}

export class SimulationRunningAdapter implements P5ViewAdapter {
  private config: SimulationRunningAdapterConfig

  private simulationRunningP5Ui: SimulationRunningP5Ui | null

  constructor(config: SimulationRunningAdapterConfig) {
    this.config = config

    this.simulationRunningP5Ui = null
  }

  initialize(p5Wrapper: P5Wrapper): void {
    const {height, width} = this.dimensions
    p5Wrapper.updateCanvasSize(width, height)

    this.simulationRunningP5Ui = new SimulationRunningP5Ui({
      activityController: this.config.activityController,
      appController: this.config.appController,
      p5Wrapper,
    })
  }

  deinitialize(): void {
    this.simulationRunningP5Ui = null
  }

  draw(): void {
    this.simulationRunningP5Ui?.draw()
  }

  onMouseWheel(event: WheelEvent): void {
    this.simulationRunningP5Ui?.onMouseWheel(event)
  }

  private get dimensions(): P5ViewDimensions {
    return {
      height: 576,
      width: 1024,
    }
  }
}
