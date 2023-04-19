import type {AppController} from '../../app-controller'
import {FITNESS_LABEL, FITNESS_UNIT_LABEL, FRAMES_FOR_CREATURE_FITNESS} from '../../constants'
import {CreatureDrawer} from '../../creature-drawer'
import {averagePositionOfNodes} from '../../creatures'
import {P5Wrapper} from '../../p5-utils'
import {GenerationSimulation} from '../../simulation'
import {SimulationView} from '../../views'
import type {ActivityController} from './activity-controller'

export interface SimulationRunningP5UiConfig {
  activityController: ActivityController
  appController: AppController
  p5Wrapper: P5Wrapper
}

export class SimulationRunningP5Ui {
  private appController: AppController
  private p5Wrapper: P5Wrapper

  private simulationView: SimulationView

  private activityController: ActivityController
  private generationSimulation: GenerationSimulation

  constructor(config: SimulationRunningP5UiConfig) {
    this.appController = config.appController
    this.p5Wrapper = config.p5Wrapper

    const {font, p5} = this.p5Wrapper

    this.activityController = config.activityController
    this.generationSimulation = this.activityController.getGenerationSimulation()

    this.simulationView = new SimulationView({
      cameraSpeed: 0.06,
      canvas: p5,

      creatureDrawer: new CreatureDrawer({
        p5Wrapper: this.p5Wrapper,
      }),

      creatureSimulation: this.generationSimulation.getCreatureSimulation(),
      height: 900,
      postFont: font,
      showArrow: true,
      simulationConfig: this.appController.getSimulationConfig(),
      statsFont: font,
      width: 1600,
    })

    this.simulationView.setCameraZoom(0.01)
    this.simulationView.setCameraPosition(0, 0)
  }

  draw(): void {
    const {activityController, p5Wrapper} = this
    const {height, p5, width} = p5Wrapper

    activityController.advanceActivity()

    const speed = this.activityController.getSimulationSpeed()
    const timer = this.activityController.getTimer()

    if (timer === speed) {
      // At the first render, reset the camera.
      this.simulationView.setCameraZoom(0.01)
      this.simulationView.setCameraPosition(0, 0)
    }

    this.simulationView.draw()
    p5.image(this.simulationView.graphics, 0, 0, width, height)

    if (timer >= FRAMES_FOR_CREATURE_FITNESS && speed < 30) {
      // When the simulation speed is slow enough, display the creature's fitness.
      this.drawFinalFitness()
    }
  }

  onMouseWheel(event: WheelEvent): void {
    const delta = event.deltaX

    if (delta < 0) {
      this.simulationView.zoomIn()
    } else if (delta > 0) {
      this.simulationView.zoomOut()
    }
  }

  private drawFinalFitness(): void {
    const {generationSimulation} = this
    const {font, height, p5, width} = this.p5Wrapper

    const {nodes} = generationSimulation.getCreatureSimulationState().creature

    const {averageX} = averagePositionOfNodes(nodes)

    p5.noStroke()
    p5.fill(0, 0, 0, 130)
    p5.rect(0, 0, width, height)
    p5.fill(0, 0, 0, 255)
    p5.rect(width / 2 - 500, 200, 1000, 240)
    p5.fill(255, 0, 0)
    p5.textAlign(p5.CENTER)
    p5.textFont(font, 96)
    p5.text("Creature's " + FITNESS_LABEL + ':', width / 2, 300)
    p5.text(p5.nf(averageX * 0.2, 0, 2) + ' ' + FITNESS_UNIT_LABEL, width / 2, 400)
  }
}
