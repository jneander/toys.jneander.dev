import {
  ActivityId,
  CREATURE_COUNT,
  FITNESS_LABEL,
  FITNESS_UNIT_LABEL
} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import {averagePositionOfNodes} from '../helpers'
import type {SimulationState} from '../types'
import {SimulationView, Widget, WidgetConfig} from '../views'
import {Activity, ActivityConfig} from './shared'

export class SimulationRunningActivity extends Activity {
  private simulationView: SimulationView
  private skipButton: StepByStepSkipButton
  private playbackSpeedButton: StepByStepPlaybackSpeedButton
  private finishButton: StepByStepFinishButton

  constructor(config: ActivityConfig) {
    super(config)

    const {canvas, font} = this.appView

    this.simulationView = new SimulationView({
      appState: this.appState,
      creatureDrawer: new CreatureDrawer({appView: this.appView}),
      height: 900,
      p5: canvas,
      postFont: font,
      showArrow: true,
      simulationConfig: this.simulationConfig,
      simulationState: this.simulationState,
      statsFont: font,
      width: 1600
    })

    const widgetConfig = {
      appController: this.appController,
      appState: this.appState,
      appView: this.appView
    }

    const simulationWidgetConfig = {
      ...widgetConfig,
      simulationState: this.simulationState
    }

    this.skipButton = new StepByStepSkipButton(widgetConfig)
    this.playbackSpeedButton = new StepByStepPlaybackSpeedButton(
      simulationWidgetConfig
    )
    this.finishButton = new StepByStepFinishButton(widgetConfig)
  }

  deinitialize(): void {
    this.simulationView.deinitialize()
  }

  draw(): void {
    const {appController, appState, appView} = this
    const {canvas, height, width} = appView

    if (appState.viewTimer <= 900) {
      for (let s = 0; s < this.simulationState.speed; s++) {
        if (appState.viewTimer < 900) {
          // For each point of speed, advance through one cycle of simulation.
          appController.advanceSimulation()
        }
      }

      this.updateCameraPosition()
      this.simulationView.draw()

      canvas.image(this.simulationView.graphics, 0, 0, width, height)

      this.skipButton.draw()
      this.playbackSpeedButton.draw()
      this.finishButton.draw()
    }

    if (appState.viewTimer == 900) {
      if (this.simulationState.speed < 30) {
        // When the simulation speed is slow enough, display the creature's fitness.
        this.drawFinalFitness()
      } else {
        // When the simulation speed is too fast, skip ahead to next simulation using the timer.
        appState.viewTimer = 1020
      }

      appController.setFitnessOfSimulationCreature()
    }

    if (appState.viewTimer >= 1020) {
      appState.creaturesTested++

      if (appState.creaturesTested < CREATURE_COUNT) {
        appController.setSimulationState(
          appState.creaturesInLatestGeneration[appState.creaturesTested]
        )
      } else {
        appController.setActivityId(ActivityId.SimulationFinished)
      }

      this.simulationState.camera.x = 0
    }

    if (appState.viewTimer >= 900) {
      appState.viewTimer += this.simulationState.speed
    }
  }

  onMouseReleased(): void {
    if (this.skipButton.isUnderCursor()) {
      this.skipButton.onClick()
    } else if (this.playbackSpeedButton.isUnderCursor()) {
      this.playbackSpeedButton.onClick()
    } else if (this.finishButton.isUnderCursor()) {
      this.finishButton.onClick()
    }
  }

  onMouseWheel(event: WheelEvent): void {
    const delta = event.deltaX

    if (delta < 0) {
      this.simulationState.camera.zoom *= 0.9090909

      if (this.simulationState.camera.zoom < 0.002) {
        this.simulationState.camera.zoom = 0.002
      }
    } else if (delta > 0) {
      this.simulationState.camera.zoom *= 1.1

      if (this.simulationState.camera.zoom > 0.1) {
        this.simulationState.camera.zoom = 0.1
      }
    }
  }

  private drawFinalFitness(): void {
    const {canvas, font, height, width} = this.appView

    const {averageX} = averagePositionOfNodes(
      this.simulationState.creature.nodes
    )

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

  private updateCameraPosition(): void {
    const {averageX, averageY} = averagePositionOfNodes(
      this.simulationState.creature.nodes
    )

    if (this.simulationState.speed < 30) {
      for (let s = 0; s < this.simulationState.speed; s++) {
        this.simulationState.camera.x +=
          (averageX - this.simulationState.camera.x) * 0.06
        this.simulationState.camera.y +=
          (averageY - this.simulationState.camera.y) * 0.06
      }
    } else {
      this.simulationState.camera.x = averageX
      this.simulationState.camera.y = averageY
    }
  }
}

class StepByStepSkipButton extends Widget {
  draw(): void {
    const {canvas, font, height} = this.appView

    canvas.fill(0)
    canvas.rect(0, height - 40, 90, 40)
    canvas.fill(255)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 32)
    canvas.text('SKIP', 45, height - 8)
  }

  isUnderCursor(): boolean {
    const {appView} = this
    return appView.rectIsUnderCursor(0, appView.height - 40, 90, 40)
  }

  onClick(): void {
    for (let s = this.appState.viewTimer; s < 900; s++) {
      this.appController.advanceSimulation()
    }

    this.appState.viewTimer = 1021
  }
}

interface StepByStepPlaybackSpeedButtonConfig extends WidgetConfig {
  simulationState: SimulationState
}

class StepByStepPlaybackSpeedButton extends Widget {
  private simulationState: SimulationState

  constructor(config: StepByStepPlaybackSpeedButtonConfig) {
    super(config)

    this.simulationState = config.simulationState
  }

  draw(): void {
    const {canvas, font, height} = this.appView

    canvas.fill(0)
    canvas.rect(120, height - 40, 240, 40)
    canvas.fill(255)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 32)
    canvas.text('PB speed: x' + this.simulationState.speed, 240, height - 8)
  }

  isUnderCursor(): boolean {
    const {appView} = this
    return appView.rectIsUnderCursor(120, appView.height - 40, 240, 40)
  }

  onClick(): void {
    this.simulationState.speed *= 2

    if (this.simulationState.speed === 1024) {
      this.simulationState.speed = 900
    }

    if (this.simulationState.speed >= 1800) {
      this.simulationState.speed = 1
    }
  }
}

class StepByStepFinishButton extends Widget {
  draw(): void {
    const {canvas, font, height, width} = this.appView

    canvas.fill(0)
    canvas.rect(width - 120, height - 40, 120, 40)
    canvas.fill(255)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 32)
    canvas.text('FINISH', width - 60, height - 8)
  }

  isUnderCursor(): boolean {
    const {height, width} = this.appView

    return this.appView.rectIsUnderCursor(width - 120, height - 40, 120, 40)
  }

  onClick(): void {
    this.appController.finishGenerationSimulation()
  }
}
