import {useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId, FITNESS_LABEL, FITNESS_UNIT_LABEL} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import {averagePositionOfNodes} from '../helpers'
import {CreatureSimulation, GenerationSimulation} from '../simulation'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {ButtonWidget, ButtonWidgetConfig, SimulationView} from '../views'
import {Activity, ActivityConfig} from './shared'

export interface SimulationRunningActivityProps {
  appController: AppController
  appStore: AppStore
}

export function SimulationRunningActivity(
  props: SimulationRunningActivityProps
) {
  const {appController, appStore} = props

  const sketchFn = useMemo(() => {
    function createActivityFn({appView}: CreateActivityFnParameters) {
      return new SimulationRunningP5Activity({appController, appStore, appView})
    }

    return createSketchFn({createActivityFn})
  }, [appController, appStore])

  return <P5ClientView sketch={sketchFn} />
}

class SimulationRunningP5Activity extends Activity {
  private simulationView: SimulationView
  private skipButton: SkipButton
  private playbackSpeedButton: PlaybackSpeedButton
  private finishButton: FinishButton

  private generationSimulation: GenerationSimulation

  private activityTimer: number

  constructor(config: ActivityConfig) {
    super(config)

    const {canvas, font} = this.appView

    this.generationSimulation = new GenerationSimulation({
      appStore: this.appStore,
      simulationConfig: this.appController.getSimulationConfig()
    })

    this.simulationView = new SimulationView({
      cameraSpeed: 0.06,
      creatureDrawer: new CreatureDrawer({appView: this.appView}),
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

    this.skipButton = new SkipButton({
      appView: this.appView,

      onClick: this.handleSkip.bind(this)
    })

    this.playbackSpeedButton = new PlaybackSpeedButton({
      appView: this.appView,
      creatureSimulation: this.generationSimulation.getCreatureSimulation(),

      onClick: () => {
        const creatureSimulation =
          this.generationSimulation.getCreatureSimulation()

        let {speed} = creatureSimulation.getState()

        speed *= 2

        if (speed === 1024) {
          speed = 900
        }

        if (speed >= 1800) {
          speed = 1
        }

        creatureSimulation.setSpeed(speed)
      }
    })

    this.finishButton = new FinishButton({
      appView: this.appView,

      onClick: () => {
        this.generationSimulation.finishGenerationSimulation()
        this.appController.setActivityId(ActivityId.SimulationFinished)
      }
    })

    this.activityTimer = 0
  }

  initialize(): void {
    this.generationSimulation.initialize()
  }

  draw(): void {
    const {appController, appView, generationSimulation} = this
    const {canvas, height, width} = appView

    const {speed} = generationSimulation.getCreatureSimulationState()

    if (this.activityTimer <= 900) {
      for (let s = 0; s < speed; s++) {
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
      if (speed < 30) {
        // When the simulation speed is slow enough, display the creature's fitness.
        this.drawFinalFitness()
      } else {
        // When the simulation speed is too fast, skip ahead to next simulation using the timer.
        this.activityTimer = 1020
      }
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
      this.activityTimer += speed
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
    this.generationSimulation.advanceCreatureSimulation()
    this.activityTimer++
  }

  private drawFinalFitness(): void {
    const {generationSimulation} = this
    const {canvas, font, height, width} = this.appView

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
  creatureSimulation: CreatureSimulation
}

class PlaybackSpeedButton extends ButtonWidget {
  private creatureSimulation: CreatureSimulation

  constructor(config: StepByStepPlaybackSpeedButtonConfig) {
    super(config)

    this.creatureSimulation = config.creatureSimulation
  }

  draw(): void {
    const {canvas, font, height} = this.appView

    const {speed} = this.creatureSimulation.getState()

    canvas.fill(0)
    canvas.rect(120, height - 40, 240, 40)
    canvas.fill(255)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 32)
    canvas.text('PB speed: x' + speed, 240, height - 8)
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
