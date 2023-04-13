import {useStore} from '../../../shared/state'
import {
  GenerateCreaturesActivity,
  GenerationViewActivity,
  PostSimulationActivity,
  SimulationRunningActivity,
  StartActivity,
} from './activities'
import type {AppController} from './app-controller'
import {ActivityId} from './constants'
import type {AppState, AppStore} from './types'

function getCurrentActivityId(appState: AppState): ActivityId | null {
  return appState.currentActivityId
}

interface CarykhEvolutionSimulatorProps {
  controller: AppController
  store: AppStore
}

export function CarykhEvolutionSimulator(props: CarykhEvolutionSimulatorProps) {
  const {controller, store} = props

  const currentActivityId = useStore(store, getCurrentActivityId)

  if (currentActivityId === ActivityId.GenerateCreatures) {
    return <GenerateCreaturesActivity appController={controller} appStore={store} />
  }

  if (currentActivityId === ActivityId.GenerationView) {
    return <GenerationViewActivity appController={controller} appStore={store} />
  }

  if (currentActivityId === ActivityId.SimulationRunning) {
    return <SimulationRunningActivity appController={controller} appStore={store} />
  }

  if (currentActivityId === ActivityId.PostSimulation) {
    return <PostSimulationActivity appController={controller} appStore={store} />
  }

  return <StartActivity appController={controller} />
}
