import {ActivityId, FITNESS_LABEL, FITNESS_UNIT_LABEL} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import {averagePositionOfNodes} from '../helpers'
import type {SimulationState} from '../types'
import {ButtonWidget, ButtonWidgetConfig, SimulationView} from '../views'
import {Activity, ActivityConfig} from './shared'

export class SimulationRunningActivity extends Activity {
  private simulationView: SimulationView
  private skipButton: SkipButton
  private playbackSpeedButton: PlaybackSpeedButton
  private finishButton: FinishButton

  private activityTimer: number

  constructor(config: ActivityConfig) {
    super(config)

    const {canvas, font} = this.appView

    this.simulationView = new SimulationView({
      cameraSpeed: 0.06,
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

    this.simulationView.setCameraZoom(0.01)
    this.simulationView.setCameraPosition(0, 0)

    const widgetConfig = {
      appState: this.appState,
      appView: this.appView
    }

    this.skipButton = new SkipButton({
      ...widgetConfig,

      onClick: this.handleSkip.bind(this)
    })

    this.playbackSpeedButton = new PlaybackSpeedButton({
      ...widgetConfig,
      simulationState: this.simulationState,

      onClick: () => {
        this.simulationState.speed *= 2

        if (this.simulationState.speed === 1024) {
          this.simulationState.speed = 900
        }

        if (this.simulationState.speed >= 1800) {
          this.simulationState.speed = 1
        }
      }
    })

    this.finishButton = new FinishButton({
      ...widgetConfig,

      onClick: () => {
        this.appController.generationSimulation.finishGenerationSimulation()
        this.appController.setActivityId(ActivityId.SimulationFinished)
      }
    })

    this.activityTimer = 0
  }

  initialize(): void {
    this.appController.generationSimulation.initialize()
  }

  deinitialize(): void {
    this.simulationView.deinitialize()
  }

  draw(): void {
    const {appController, appView} = this
    const {canvas, height, width} = appView
    const {generationSimulation} = appController

    if (this.activityTimer <= 900) {
      for (let s = 0; s < this.simulationState.speed; s++) {
        if (this.activityTimer < 900) {
          // For each point of speed, advance through one cycle of simulation.
          this.advanceSimulation()
        }
      }

      this.simulationView.draw()

      canvas.image(this.simulationView.graphics, 0, 0, width, height)

      this.skipButton.draw()
      this.playbackSpeedButton.draw()
      this.finishButton.draw()
    }

    if (this.activityTimer == 900) {
      if (this.simulationState.speed < 30) {
        // When the simulation speed is slow enough, display the creature's fitness.
        this.drawFinalFitness()
      } else {
        // When the simulation speed is too fast, skip ahead to next simulation using the timer.
        this.activityTimer = 1020
      }

      generationSimulation.setFitnessOfSimulationCreature()
    }

    if (this.activityTimer >= 1020) {
      generationSimulation.advanceGenerationSimulation()

      if (!generationSimulation.isFinished()) {
        this.activityTimer = 0
        this.simulationView.setCameraZoom(0.01)
        this.simulationView.setCameraPosition(0, 0)
      } else {
        appController.setActivityId(ActivityId.SimulationFinished)
      }
    }

    if (this.activityTimer >= 900) {
      this.activityTimer += this.simulationState.speed
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
      this.simulationView.zoomIn()
    } else if (delta > 0) {
      this.simulationView.zoomOut()
    }
  }

  private advanceSimulation(): void {
    this.appController.generationSimulation.advanceCreatureSimulation()
    this.activityTimer++
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

  private handleSkip(): void {
    for (let count = this.activityTimer; count < 900; count++) {
      this.advanceSimulation()
    }

    this.activityTimer = 1021
  }
}

class SkipButton extends ButtonWidget {
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
}

interface StepByStepPlaybackSpeedButtonConfig extends ButtonWidgetConfig {
  simulationState: SimulationState
}

class PlaybackSpeedButton extends ButtonWidget {
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
}

class FinishButton extends ButtonWidget {
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
}
