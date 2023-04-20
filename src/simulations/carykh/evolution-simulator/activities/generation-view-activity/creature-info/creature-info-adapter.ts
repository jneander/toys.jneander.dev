import {CreatureDrawer} from '../../../creature-drawer'
import type {Creature} from '../../../creatures'
import type {P5ViewAdapter, P5ViewDimensions, P5Wrapper} from '../../../p5-utils'
import {CreatureSimulation, SimulationConfig} from '../../../simulation'
import {SimulationView} from '../../../views'
import type {CreatureInfoStore} from './types'

export interface CreatureInfoAdapterConfig {
  creature: Creature
  creatureInfoStore: CreatureInfoStore
  simulationConfig: SimulationConfig
}

export class CreatureInfoAdapter implements P5ViewAdapter {
  private config: CreatureInfoAdapterConfig

  private p5Wrapper?: P5Wrapper
  private creatureDrawer?: CreatureDrawer
  private simulationView?: SimulationView
  private creatureSimulation?: CreatureSimulation

  private creatureDrawn: boolean
  private simulationStarted: boolean

  constructor(config: CreatureInfoAdapterConfig) {
    this.config = config

    this.creatureDrawn = false
    this.simulationStarted = false
  }

  initialize(p5Wrapper: P5Wrapper): void {
    this.p5Wrapper = p5Wrapper

    const {height, width} = this.dimensions
    p5Wrapper.updateCanvasSize(width, height)

    this.creatureDrawn = false
    this.simulationStarted = false

    this.creatureDrawer = new CreatureDrawer({
      p5Wrapper: this.p5Wrapper,
    })

    this.creatureSimulation = new CreatureSimulation(this.config.simulationConfig)

    const {font, p5} = p5Wrapper

    this.simulationView = new SimulationView({
      cameraSpeed: 0.1,
      creatureDrawer: this.creatureDrawer,
      creatureSimulation: this.creatureSimulation,
      height: 480,
      p5,
      postFont: font,
      showArrow: false,
      simulationConfig: this.config.simulationConfig,
      statsFont: font,
      width: 480,
    })

    this.simulationView.setCameraZoom(0.009)
  }

  deinitialize(): void {
    delete this.creatureDrawer
    delete this.creatureSimulation
    delete this.simulationView
    delete this.p5Wrapper

    this.creatureDrawn = false
    this.simulationStarted = false
  }

  draw(): void {
    const {creatureDrawer, creatureSimulation, p5Wrapper, simulationView} = this

    if (!(creatureDrawer && creatureSimulation && p5Wrapper && simulationView)) {
      return
    }

    const {creature, creatureInfoStore} = this.config
    const {p5} = p5Wrapper

    const {showSimulation} = creatureInfoStore.getState()

    if (showSimulation) {
      if (!this.simulationStarted) {
        creatureSimulation.setState(creature)
        this.simulationStarted = true
      }

      simulationView.draw()
      p5.image(simulationView.graphics, 0, 0, p5.width, p5.height)

      creatureSimulation.advance()
      this.creatureDrawn = false
    } else {
      if (this.simulationStarted) {
        simulationView.setCameraPosition(0, 0)
        this.simulationStarted = false
      }

      if (!this.creatureDrawn) {
        p5.background(220)
        p5.translate(p5.width / 2, p5.height / 2)
        p5.scale(80)

        creatureDrawer.drawCreature(creature, 0, 0, p5)
        this.creatureDrawn = true
      }
    }
  }

  private get dimensions(): P5ViewDimensions {
    return {
      height: 240,
      width: 240,
    }
  }
}
