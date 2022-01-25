import {AleaNumberGenerator} from '@jneander/utils-random'
import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {useStore} from '../../../shared/state'
import {
  CullCreaturesActivity,
  GenerateCreaturesActivity,
  GenerationViewActivity,
  PropagateCreaturesActivity,
  SimulationFinishedActivity,
  SimulationRunningActivity,
  SortedCreaturesActivity,
  SortingCreaturesActivity,
  StartActivity
} from './activities'
import {AppController} from './app-controller'
import {ActivityId} from './constants'
import {SimulationConfig} from './simulation'
import {AppState, AppStore} from './types'

function getCurrentActivityId(appState: AppState): ActivityId | null {
  return appState.currentActivityId
}

export function CarykhEvolutionSimulator() {
  const appStore = useMemo<AppStore>(() => {
    return new Store<AppState>({
      creaturesInLatestGeneration: [],
      currentActivityId: ActivityId.Start,
      generationCount: -1,
      generationHistoryMap: {},
      selectedGeneration: 0
    })
  }, [])

  const appController = useMemo<AppController>(() => {
    const SEED = 0
    const randomNumberGenerator = new AleaNumberGenerator({seed: SEED})

    const simulationConfig: SimulationConfig = {
      hazelStairs: -1
    }

    return new AppController({
      appStore,
      randomNumberGenerator,
      simulationConfig
    })
  }, [appStore])

  const currentActivityId = useStore(appStore, getCurrentActivityId)

  if (currentActivityId === ActivityId.GenerateCreatures) {
    return (
      <GenerateCreaturesActivity
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.GenerationView) {
    return (
      <GenerationViewActivity
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.SimulationRunning) {
    return (
      <SimulationRunningActivity
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.SimulationFinished) {
    return (
      <SimulationFinishedActivity
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.SortingCreatures) {
    return (
      <SortingCreaturesActivity
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.SortedCreatures) {
    return (
      <SortedCreaturesActivity
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.CullCreatures) {
    return (
      <CullCreaturesActivity
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.PropagateCreatures) {
    return (
      <PropagateCreaturesActivity
        appController={appController}
        appStore={appStore}
      />
    )
  }

  return <StartActivity appController={appController} appStore={appStore} />
}
