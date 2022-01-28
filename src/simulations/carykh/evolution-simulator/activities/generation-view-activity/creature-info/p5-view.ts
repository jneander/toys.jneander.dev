import {CreatureDrawer} from '../../../creature-drawer'
import type {Creature} from '../../../creatures'
import type {P5Wrapper} from '../../../p5-utils'
import {CreatureSimulation, SimulationConfig} from '../../../simulation'
import {SimulationView} from '../../../views'
import type {CreatureInfoStore} from './types'

export interface CreatureInfoP5ViewConfig {
  creature: Creature
  p5Wrapper: P5Wrapper
  simulationConfig: SimulationConfig
  store: CreatureInfoStore
}

export class CreatureInfoP5View {
  private creature: Creature
  private p5Wrapper: P5Wrapper
  private store: CreatureInfoStore

  private creatureDrawer: CreatureDrawer
  private simulationView: SimulationView
  private simulationConfig: SimulationConfig
  private creatureSimulation: CreatureSimulation

  private creatureDrawn: boolean
  private simulationStarted: boolean

  constructor(config: CreatureInfoP5ViewConfig) {
    this.creature = config.creature
    this.p5Wrapper = config.p5Wrapper
    this.simulationConfig = config.simulationConfig
    this.store = config.store

    this.creatureDrawn = false
    this.simulationStarted = false

    this.creatureDrawer = new CreatureDrawer({
      p5Wrapper: this.p5Wrapper
    })

    this.creatureSimulation = new CreatureSimulation(this.simulationConfig)

    const {canvas, font} = this.p5Wrapper

    this.simulationView = new SimulationView({
      cameraSpeed: 0.1,
      creatureDrawer: new CreatureDrawer({p5Wrapper: this.p5Wrapper}),
      creatureSimulation: this.creatureSimulation,
      height: 480,
      p5: canvas,
      postFont: font,
      showArrow: false,
      simulationConfig: this.simulationConfig,
      statsFont: font,
      width: 480
    })

    this.simulationView.setCameraZoom(0.009)
  }

  draw(): void {
    const {creature, p5Wrapper, store} = this
    const {canvas} = p5Wrapper

    const {showSimulation} = store.getState()

    if (showSimulation) {
      if (!this.simulationStarted) {
        this.creatureSimulation.setState(creature)
        this.simulationStarted = true
      }

      this.simulationView.draw()
      canvas.image(
        this.simulationView.graphics,
        0,
        0,
        canvas.width,
        canvas.height
      )

      this.creatureSimulation.advance()
      this.creatureDrawn = false
    } else {
      if (this.simulationStarted) {
        this.simulationView.setCameraPosition(0, 0)
        this.simulationStarted = false
      }

      if (!this.creatureDrawn) {
        canvas.background(220)
        canvas.scale(0.08)

        this.creatureDrawer.drawCreature(creature, 1.5, 2.25, canvas)
        this.creatureDrawn = true
      }
    }
  }
}