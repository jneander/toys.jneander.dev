import type {AppController} from '../../app-controller'
import {
  ActivityId,
  FRAMES_FOR_CREATURE_FITNESS,
  SIMULATION_SPEED_INITIAL,
  SIMULATION_SPEED_MAX
} from '../../constants'
import {GenerationSimulation} from '../../simulation'
import type {AppStore} from '../../types'
import {FRAMES_BEFORE_ADVANCING_GENERATION} from './constants'
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

  advanceActivity(): void {
    const {appController, generationSimulation} = this

    const speed = this.getSimulationSpeed()

    let timer = this.getTimer()

    for (let s = 0; s < speed; s++) {
      if (timer < FRAMES_FOR_CREATURE_FITNESS) {
        // For each point of speed, advance through one cycle of simulation.
        this.advanceCreatureSimulation()
        timer = this.getTimer()
      }
    }

    if (timer === FRAMES_FOR_CREATURE_FITNESS && speed >= 30) {
      // When the simulation speed is too fast, skip ahead to next simulation using the timer.
      this.setTimer(FRAMES_BEFORE_ADVANCING_GENERATION)
    }

    timer = this.getTimer()

    if (timer >= FRAMES_BEFORE_ADVANCING_GENERATION) {
      generationSimulation.advanceGenerationSimulation()

      if (!generationSimulation.isFinished()) {
        this.setTimer(0)
      } else {
        appController.setActivityId(ActivityId.PostSimulation)
      }
    }

    timer = this.getTimer()

    if (timer >= FRAMES_FOR_CREATURE_FITNESS) {
      this.setTimer(timer + speed)
    }
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
    this.appController.setActivityId(ActivityId.PostSimulation)
  }
}
