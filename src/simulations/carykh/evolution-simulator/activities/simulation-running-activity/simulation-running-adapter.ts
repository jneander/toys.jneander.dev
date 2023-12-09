import type {AppController} from '../../app-controller'
import {FITNESS_LABEL, FITNESS_UNIT_LABEL, FRAMES_FOR_CREATURE_FITNESS} from '../../constants'
import {CreatureDrawer} from '../../creature-drawer'
import {averagePositionOfNodes} from '../../creatures'
import type {P5CanvasContainer, P5ViewAdapter, P5ViewDimensions, P5Wrapper} from '../../p5-utils'
import type {GenerationSimulation} from '../../simulation'
import {SimulationView} from '../../views'
import type {ActivityController} from './activity-controller'

export interface SimulationRunningAdapterConfig {
  activityController: ActivityController
  appController: AppController
}

export class SimulationRunningAdapter implements P5ViewAdapter {
  private config: SimulationRunningAdapterConfig

  private p5Wrapper?: P5Wrapper
  private simulationView?: SimulationView
  private generationSimulation?: GenerationSimulation

  constructor(config: SimulationRunningAdapterConfig) {
    this.config = config
  }

  initialize(p5Wrapper: P5Wrapper, container: P5CanvasContainer): void {
    this.p5Wrapper = p5Wrapper

    const {height, width} = this.getDimensions(container)
    p5Wrapper.updateCanvasSize(width, height)

    const {font, p5} = this.p5Wrapper

    this.generationSimulation = this.config.activityController.getGenerationSimulation()

    this.simulationView = new SimulationView({
      cameraSpeed: 0.06,

      creatureDrawer: new CreatureDrawer({
        p5Wrapper: this.p5Wrapper,
      }),

      creatureSimulation: this.generationSimulation.getCreatureSimulation(),
      height,
      p5,
      postFont: font,
      showArrow: true,
      simulationConfig: this.config.appController.getSimulationConfig(),
      statsFont: font,
      width,
    })

    this.simulationView.setCameraZoom(0.01)
    this.simulationView.setCameraPosition(0, 0)
  }

  deinitialize(): void {
    delete this.generationSimulation
    delete this.p5Wrapper
    delete this.simulationView
  }

  draw(): void {
    const {p5Wrapper, simulationView} = this

    if (!(p5Wrapper && simulationView)) {
      return
    }

    const {activityController} = this.config
    const {height, p5, width} = p5Wrapper

    activityController.advanceActivity()

    const speed = activityController.getSimulationSpeed()
    const timer = activityController.getTimer()

    if (timer === speed) {
      // At the first render, reset the camera.
      simulationView.setCameraZoom(0.01)
      simulationView.setCameraPosition(0, 0)
    }

    simulationView.draw()
    p5.image(simulationView.graphics, 0, 0, width, height)

    if (timer >= FRAMES_FOR_CREATURE_FITNESS && speed < 30) {
      // When the simulation speed is slow enough, display the creature's fitness.
      this.drawFinalFitness()
    }
  }

  onMouseWheel(event: WheelEvent): void {
    const delta = event.deltaX

    if (delta < 0) {
      this.simulationView?.zoomIn()
    } else if (delta > 0) {
      this.simulationView?.zoomOut()
    }
  }

  onContainerWidthChanged(width: number): void {
    const {height} = this.getDimensionsFromWidth(width)
    this.p5Wrapper?.updateCanvasSize(width, height)
    this.simulationView?.setDimensions(width, height)
  }

  private drawFinalFitness(): void {
    const {generationSimulation, p5Wrapper} = this

    if (!(generationSimulation && p5Wrapper)) {
      return
    }

    const {font, height, p5, width} = p5Wrapper

    const {nodes} = generationSimulation.getCreatureSimulationState().creature
    const {averageX} = averagePositionOfNodes(nodes)

    const fontScale = width / 1600
    const baseFontSize = 96 * fontScale
    const textContainerHeight = baseFontSize * 2 + 20
    const baselineHeightRatio = 0.2
    const baselineOffset = baseFontSize * baselineHeightRatio

    p5.noStroke()
    p5.fill(0, 0, 0, 130)
    p5.rect(0, 0, width, height)
    p5.fill(0, 0, 0, 255)
    p5.rect(width * 0.05, height / 2 - textContainerHeight / 2, width * 0.9, textContainerHeight)
    p5.fill(255, 0, 0)
    p5.textAlign(p5.CENTER)
    p5.textFont(font, baseFontSize)

    p5.text("Creature's " + FITNESS_LABEL + ':', width / 2, height / 2 - baselineOffset)

    p5.text(
      p5.nf(averageX * 0.2, 0, 2) + ' ' + FITNESS_UNIT_LABEL,
      width / 2,
      height / 2 + baseFontSize - baselineOffset,
    )
  }

  private getDimensions(container: P5CanvasContainer): P5ViewDimensions {
    return this.getDimensionsFromWidth(container.getAvailableWidth())
  }

  private getDimensionsFromWidth(width: number): P5ViewDimensions {
    return {
      height: 576,
      width,
    }
  }
}
