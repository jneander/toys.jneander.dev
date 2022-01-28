import {
  FITNESS_LABEL,
  FITNESS_UNIT_LABEL,
  FRAMES_FOR_CREATURE_FITNESS
} from '../../constants'
import {CreatureDrawer} from '../../creature-drawer'
import {averagePositionOfNodes} from '../../creatures'
import {GenerationSimulation} from '../../simulation'
import {SimulationView} from '../../views'
import {P5Activity, P5ActivityConfig} from '../shared'
import {ActivityController} from './activity-controller'

export interface SimulationRunningActivityConfig extends P5ActivityConfig {
  activityController: ActivityController
}

export class SimulationRunningP5Activity extends P5Activity {
  private simulationView: SimulationView

  private activityController: ActivityController
  private generationSimulation: GenerationSimulation

  constructor(config: SimulationRunningActivityConfig) {
    super(config)

    const {canvas, font} = this.p5Wrapper

    this.activityController = config.activityController
    this.generationSimulation =
      this.activityController.getGenerationSimulation()

    this.simulationView = new SimulationView({
      cameraSpeed: 0.06,
      creatureDrawer: new CreatureDrawer({p5Wrapper: this.p5Wrapper}),
      creatureSimulation: this.generationSimulation.getCreatureSimulation(),
      height: 900,
      p5: canvas,
      postFont: font,
      showArrow: true,
      simulationConfig: this.appController.getSimulationConfig(),
      statsFont: font,
      width: 1600
    })

    this.simulationView.setCameraZoom(0.01)
    this.simulationView.setCameraPosition(0, 0)
  }

  draw(): void {
    const {activityController, p5Wrapper} = this
    const {canvas, height, width} = p5Wrapper

    activityController.advanceActivity()

    const speed = this.activityController.getSimulationSpeed()
    const timer = this.activityController.getTimer()

    if (timer === speed) {
      // At the first render, reset the camera.
      this.simulationView.setCameraZoom(0.01)
      this.simulationView.setCameraPosition(0, 0)
    }

    this.simulationView.draw()
    canvas.image(this.simulationView.graphics, 0, 0, width, height)

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
    const {canvas, font, height, width} = this.p5Wrapper

    const {nodes} = generationSimulation.getCreatureSimulationState().creature

    const {averageX} = averagePositionOfNodes(nodes)

    canvas.noStroke()
    canvas.fill(0, 0, 0, 130)
    canvas.rect(0, 0, width, height)
    canvas.fill(0, 0, 0, 255)
    canvas.rect(width / 2 - 500, 200, 1000, 240)
    canvas.fill(255, 0, 0)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 96)
    canvas.text("Creature's " + FITNESS_LABEL + ':', width / 2, 300)
    canvas.text(
      canvas.nf(averageX * 0.2, 0, 2) + ' ' + FITNESS_UNIT_LABEL,
      width / 2,
      400
    )
  }
}
