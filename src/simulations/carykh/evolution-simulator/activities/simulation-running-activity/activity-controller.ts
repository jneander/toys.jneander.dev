import type {AppController} from '../../app-controller'
import {
  ActivityId,
  FRAMES_FOR_CREATURE_FITNESS,
  SIMULATION_SPEED_INITIAL,
  SIMULATION_SPEED_MAX
} from '../../constants'
import {GenerationSimulation} from '../../simulation'
import type {AppStore} from '../../types'
import type {ActivityStore} from './types'

export interface ActivityControllerConfig {
  activityStore: ActivityStore
  appController: AppController
  appStore: AppStore
}

export class ActivityController {
  private appController: AppController
  private store: ActivityStore

  private generationSimulation: GenerationSimulation

  constructor(config: ActivityControllerConfig) {
    const {activityStore, appController, appStore} = config

    this.appController = appController
    this.store = activityStore

    this.generationSimulation = new GenerationSimulation({
      appStore,
      simulationConfig: appController.getSimulationConfig()
    })

    this.generationSimulation.initialize()
  }

  getGenerationSimulation(): GenerationSimulation {
    return this.generationSimulation
  }

  getSimulationSpeed(): number {
    return this.generationSimulation.getCreatureSimulation().getState().speed
  }

  setSimulationSpeed(speed: number): void {
    const creatureSimulation = this.generationSimulation.getCreatureSimulation()
    creatureSimulation.setSpeed(speed)
    this.store.setState({simulationSpeed: speed})
  }

  increaseSimulationSpeed(): void {
    let speed = this.getSimulationSpeed()

    speed *= 2

    if (speed === 1024) {
      speed = SIMULATION_SPEED_MAX
    } else if (speed > 1024) {
      // Roll over and back to initial speed.
      speed = SIMULATION_SPEED_INITIAL
    }

    this.setSimulationSpeed(speed)
  }

  getTimer(): number {
    return this.store.getState().timer
  }

  setTimer(timer: number): void {
    this.store.setState({timer})
  }

  advanceCreatureSimulation(): void {
    this.generationSimulation.advanceCreatureSimulation()
    this.setTimer(this.getTimer() + 1)
  }

  advanceGenerationSimulation(): void {
    for (
      let timer = this.getTimer();
      timer < FRAMES_FOR_CREATURE_FITNESS;
      timer++
    ) {
      this.advanceCreatureSimulation()
    }

    this.setTimer(1021)
  }

  finishGenerationSimulation(): void {
    this.generationSimulation.finishGenerationSimulation()
    this.appController.setActivityId(ActivityId.SimulationFinished)
  }
}
