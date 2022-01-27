import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {P5ClientView} from '../../../../../shared/p5'
import type {AppController} from '../../app-controller'
import {ActivityId, FITNESS_LABEL, FITNESS_UNIT_LABEL} from '../../constants'
import {CreatureDrawer} from '../../creature-drawer'
import {averagePositionOfNodes} from '../../creatures'
import {CreateUiFnParameters, createSketchFn} from '../../p5-utils'
import {CreatureSimulation, GenerationSimulation} from '../../simulation'
import type {AppStore} from '../../types'
import {ButtonWidget, ButtonWidgetConfig, SimulationView} from '../../views'
import {P5Activity, P5ActivityConfig} from '../shared'
import {ActivityController} from './activity-controller'
import type {ActivityState} from './types'

export interface SimulationRunningActivityProps {
  appController: AppController
  appStore: AppStore
}

export function SimulationRunningActivity(
  props: SimulationRunningActivityProps
) {
  const {appController, appStore} = props

  const activityStore = useMemo(() => {
    return new Store<ActivityState>({
      simulationSpeed: 1,
      timer: 0
    })
  }, [])

  const activityController = useMemo(() => {
    return new ActivityController({activityStore, appController, appStore})
  }, [activityStore, appController, appStore])

  const sketchFn = useMemo(() => {
    function createUiFn({p5Wrapper}: CreateUiFnParameters) {
      return new SimulationRunningP5Activity({
        activityController,
        appController,
        appStore,
        p5Wrapper
      })
    }

    return createSketchFn({createUiFn})
  }, [activityController, appController, appStore])

  return <P5ClientView sketch={sketchFn} />
}

interface SimulationRunningActivityConfig extends P5ActivityConfig {
  activityController: ActivityController
}

class SimulationRunningP5Activity extends P5Activity {
  private simulationView: SimulationView
  private skipButton: SkipButton
  private playbackSpeedButton: PlaybackSpeedButton
  private finishButton: FinishButton

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

    this.skipButton = new SkipButton({
      onClick: this.handleSkip.bind(this),
      p5Wrapper: this.p5Wrapper
    })

    this.playbackSpeedButton = new PlaybackSpeedButton({
      creatureSimulation: this.generationSimulation.getCreatureSimulation(),

      onClick: () => {
        this.activityController.increaseSimulationSpeed()
      },

      p5Wrapper: this.p5Wrapper
    })

    this.finishButton = new FinishButton({
      onClick: () => {
        this.generationSimulation.finishGenerationSimulation()
        this.appController.setActivityId(ActivityId.SimulationFinished)
      },

      p5Wrapper: this.p5Wrapper
    })
  }

  draw(): void {
    const {appController, generationSimulation, p5Wrapper} = this
    const {canvas, height, width} = p5Wrapper

    const speed = this.activityController.getSimulationSpeed()

    let timer = this.activityController.getTimer()

    if (timer <= 900) {
      for (let s = 0; s < speed; s++) {
        if (timer < 900) {
          // For each point of speed, advance through one cycle of simulation.
          this.activityController.advanceCreatureSimulation()
          timer = this.activityController.getTimer()
        }
      }

      this.simulationView.draw()

      canvas.image(this.simulationView.graphics, 0, 0, width, height)

      this.skipButton.draw()
      this.playbackSpeedButton.draw()
      this.finishButton.draw()
    }

    if (timer == 900) {
      if (speed < 30) {
        // When the simulation speed is slow enough, display the creature's fitness.
        this.drawFinalFitness()
      } else {
        // When the simulation speed is too fast, skip ahead to next simulation using the timer.
        this.activityController.setTimer(1020)
      }
    }

    timer = this.activityController.getTimer()

    if (timer >= 1020) {
      generationSimulation.advanceGenerationSimulation()

      if (!generationSimulation.isFinished()) {
        this.activityController.setTimer(0)
        this.simulationView.setCameraZoom(0.01)
        this.simulationView.setCameraPosition(0, 0)
      } else {
        appController.setActivityId(ActivityId.SimulationFinished)
      }
    }

    timer = this.activityController.getTimer()

    if (timer >= 900) {
      this.activityController.setTimer(timer + speed)
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

  private handleSkip(): void {
    const timer = this.activityController.getTimer()
    for (let count = timer; count < 900; count++) {
      this.activityController.advanceCreatureSimulation()
    }

    this.activityController.setTimer(1021)
  }
}

class SkipButton extends ButtonWidget {
  draw(): void {
    const {canvas, font, height} = this.p5Wrapper

    canvas.fill(0)
    canvas.rect(0, height - 40, 90, 40)
    canvas.fill(255)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 32)
    canvas.text('SKIP', 45, height - 8)
  }

  isUnderCursor(): boolean {
    const {p5Wrapper} = this
    return p5Wrapper.rectIsUnderCursor(0, p5Wrapper.height - 40, 90, 40)
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
    const {canvas, font, height} = this.p5Wrapper

    const {speed} = this.creatureSimulation.getState()

    canvas.fill(0)
    canvas.rect(120, height - 40, 240, 40)
    canvas.fill(255)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 32)
    canvas.text('PB speed: x' + speed, 240, height - 8)
  }

  isUnderCursor(): boolean {
    const {p5Wrapper} = this
    return p5Wrapper.rectIsUnderCursor(120, p5Wrapper.height - 40, 240, 40)
  }
}

class FinishButton extends ButtonWidget {
  draw(): void {
    const {canvas, font, height, width} = this.p5Wrapper

    canvas.fill(0)
    canvas.rect(width - 120, height - 40, 120, 40)
    canvas.fill(255)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 32)
    canvas.text('FINISH', width - 60, height - 8)
  }

  isUnderCursor(): boolean {
    const {height, width} = this.p5Wrapper

    return this.p5Wrapper.rectIsUnderCursor(width - 120, height - 40, 120, 40)
  }
}
