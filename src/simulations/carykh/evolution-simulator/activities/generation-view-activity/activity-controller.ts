import {ControlledLoopSync} from '@jneander/utils-async'

import type {AppController} from '../../app-controller'
import {ActivityId, FITNESS_PERCENTILE_CREATURE_INDICES, HISTOGRAM_BAR_SPAN} from '../../constants'
import {GenerationSimulation} from '../../simulation'
import type {AppStore, GenerationHistoryEntry} from '../../types'
import {GenerationSimulationMode} from './constants'
import type {ActivityStore} from './types'

export interface ActivityControllerConfig {
  activityStore: ActivityStore
  appController: AppController
  appStore: AppStore
}

export class ActivityController {
  private activityStore: ActivityStore
  private appController: AppController
  private appStore: AppStore

  constructor(config: ActivityControllerConfig) {
    const {activityStore, appController, appStore} = config

    this.activityStore = activityStore
    this.appController = appController
    this.appStore = appStore
  }

  isSimulating(): boolean {
    return this.activityStore.getState().currentGenerationSimulation != null
  }

  performStepByStepSimulation(): void {
    if (this.isSimulating()) {
      return
    }

    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.StepByStep,
      pendingGenerationCount: 0,
    })
    this.appController.setActivityId(ActivityId.SimulationRunning)
  }

  async performQuickGenerationSimulation(): Promise<void> {
    if (this.isSimulating()) {
      return
    }

    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.Quick,
      pendingGenerationCount: 0,
    })

    await this.simulateWholeGeneration()

    this.appController.setActivityId(ActivityId.PostSimulation)
  }

  performAsapGenerationSimulation(): void {
    if (this.isSimulating()) {
      return
    }

    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.ASAP,
      pendingGenerationCount: 1,
    })

    this.enqueueGenerationSimulationCycle()
  }

  startAlapGenerationSimulation(): void {
    if (this.isSimulating()) {
      return
    }

    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.ASAP,
      pendingGenerationCount: 1000000000,
    })

    this.enqueueGenerationSimulationCycle()
  }

  endAlapGenerationSimulation(): void {
    this.activityStore.setState({pendingGenerationCount: 0})
  }

  getSelectedGenerationHistoryEntry(): GenerationHistoryEntry | null {
    const {generationHistoryMap, selectedGeneration} = this.appStore.getState()

    return generationHistoryMap[selectedGeneration]
  }

  getFitnessPercentilesFromHistory(generation: number): number[] {
    const historyEntry = this.appStore.getState().generationHistoryMap[generation]

    if (historyEntry) {
      return historyEntry.fitnessPercentiles
    }

    return new Array(FITNESS_PERCENTILE_CREATURE_INDICES.length).fill(0)
  }

  getHistogramBarCountsFromHistory(generation: number): number[] {
    const historyEntry = this.appStore.getState().generationHistoryMap[generation]

    if (historyEntry) {
      return historyEntry.histogramBarCounts
    }

    return new Array(HISTOGRAM_BAR_SPAN).fill(0)
  }

  private enqueueGenerationSimulationCycle(): void {
    requestAnimationFrame(() => {
      this.performGenerationCycle()
    })
  }

  private async performGenerationCycle(): Promise<void> {
    const {appController} = this

    await this.simulateWholeGeneration()

    appController.sortCreatures()
    appController.updateHistory()
    appController.cullCreatures()
    appController.propagateCreatures()

    setTimeout(() => {
      this.maybePerformAdditionalCycle()
    }, 0)
  }

  private maybePerformAdditionalCycle(): void {
    const state = this.activityStore.getState()
    let {pendingGenerationCount} = state

    if (state.generationSimulationMode !== GenerationSimulationMode.ASAP) {
      return
    }

    if (pendingGenerationCount > 0) {
      pendingGenerationCount--

      this.activityStore.setState({
        pendingGenerationCount,
      })
    }

    if (pendingGenerationCount > 0) {
      this.performGenerationCycle()
    }
  }

  private async simulateWholeGeneration(): Promise<void> {
    return new Promise(resolve => {
      const generationSimulation = new GenerationSimulation({
        appStore: this.appStore,
        simulationConfig: this.appController.getSimulationConfig(),
      })

      generationSimulation.initialize()

      this.activityStore.setState({
        currentGenerationSimulation: generationSimulation,
      })

      const loopFn = () => {
        if (!generationSimulation.isFinished()) {
          generationSimulation.performCreatureSimulation()
          return
        }

        loop.stop()
        this.activityStore.setState({currentGenerationSimulation: null})

        resolve()
      }

      const loop = new ControlledLoopSync({loopFn})
      loop.start()
    })
  }
}
