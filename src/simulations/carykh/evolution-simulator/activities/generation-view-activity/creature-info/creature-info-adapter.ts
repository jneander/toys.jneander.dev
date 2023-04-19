import {Creature} from '../../../creatures'
import type {P5ViewAdapter, P5ViewDimensions, P5Wrapper} from '../../../p5-utils'
import {SimulationConfig} from '../../../simulation'
import {CreatureInfoP5Ui} from './creature-info-p5-ui'
import type {CreatureInfoStore} from './types'

export interface CreatureInfoAdapterConfig {
  creature: Creature
  creatureInfoStore: CreatureInfoStore
  simulationConfig: SimulationConfig
}

export class CreatureInfoAdapter implements P5ViewAdapter {
  private config: CreatureInfoAdapterConfig

  private creatureInfoP5Ui: CreatureInfoP5Ui | null

  constructor(config: CreatureInfoAdapterConfig) {
    this.config = config

    this.creatureInfoP5Ui = null
  }

  initialize(p5Wrapper: P5Wrapper): void {
    const {height, width} = this.dimensions
    p5Wrapper.updateCanvasSize(width, height)

    this.creatureInfoP5Ui = new CreatureInfoP5Ui({
      creature: this.config.creature,
      p5Wrapper,
      simulationConfig: this.config.simulationConfig,
      store: this.config.creatureInfoStore,
    })
  }

  deinitialize(): void {
    this.creatureInfoP5Ui = null
  }

  draw(): void {
    this.creatureInfoP5Ui?.draw()
  }

  private get dimensions(): P5ViewDimensions {
    return {
      height: 240,
      width: 240,
    }
  }
}
