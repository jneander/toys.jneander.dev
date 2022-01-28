import type {AppController} from '../../app-controller'
import {
  ActivityId,
  FITNESS_PERCENTILE_CREATURE_INDICES,
  HISTOGRAM_BAR_SPAN
} from '../../constants'
import type {Creature} from '../../creatures'
import {GenerationSimulation} from '../../simulation'
import type {AppStore} from '../../types'
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

  performStepByStepSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.StepByStep,
      pendingGenerationCount: 0
    })
    this.appController.setActivityId(ActivityId.SimulationRunning)
  }

  performQuickGenerationSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.Quick,
      pendingGenerationCount: 0
    })
    this.simulateWholeGeneration()
    this.appController.setActivityId(ActivityId.SimulationFinished)
  }

  performAsapGenerationSimulation(): void {
    this.activityStore.setState({pendingGenerationCount: 1})
    this.startGenerationSimulation()
  }

  startAlapGenerationSimulation(): void {
    this.activityStore.setState({pendingGenerationCount: 1000000000})
    this.startGenerationSimulation()
  }

  startGenerationSimulation(): void {
    this.activityStore.setState({
      generationSimulationMode: GenerationSimulationMode.ASAP
    })
  }

  simulateWholeGeneration(): void {
    const generationSimulation = new GenerationSimulation({
      appStore: this.appStore,
      simulationConfig: this.appController.getSimulationConfig()
    })

    generationSimulation.simulateWholeGeneration()
  }

  getWorstMedianOrBestCreatureFromHistory(
    worstMedianOrBestIndex: number
  ): Creature {
    const {generationHistoryMap, selectedGeneration} = this.appStore.getState()

    const historyEntry = generationHistoryMap[selectedGeneration]

    if (worstMedianOrBestIndex === 0) {
      return historyEntry.slowest
    }

    if (worstMedianOrBestIndex === 1) {
      return historyEntry.median
    }

    return historyEntry.fastest
  }

  getFitnessPercentilesFromHistory(generation: number): number[] {
    const historyEntry =
      this.appStore.getState().generationHistoryMap[generation]

    if (historyEntry) {
      return historyEntry.fitnessPercentiles
    }

    return new Array(FITNESS_PERCENTILE_CREATURE_INDICES.length).fill(0)
  }

  getHistogramBarCountsFromHistory(generation: number): number[] {
    const historyEntry =
      this.appStore.getState().generationHistoryMap[generation]

    if (historyEntry) {
      return historyEntry.histogramBarCounts
    }

    return new Array(HISTOGRAM_BAR_SPAN).fill(0)
  }
}
