import {useStore} from '../../../../../shared/state'
import {AppController} from '../../app-controller'
import {ActivityId} from '../../constants'
import {AppState, AppStore} from '../../types'
import {CullCreaturesActivity} from './cull-creatures-activity'
import {PropagateCreaturesActivity} from './propagate-creatures-activity'
import {SimulationFinishedActivity} from './simulation-finished-activity'
import {SortedCreaturesActivity} from './sorted-creatures-activity'
import {SortingCreaturesActivity} from './sorting-creatures-activity'

function getCurrentActivityId(appState: AppState): ActivityId | null {
  return appState.currentActivityId
}

export interface PostSimulationActivityProps {
  appController: AppController
  appStore: AppStore
}

export function PostSimulationActivity(props: PostSimulationActivityProps) {
  const {appController, appStore} = props

  const currentActivityId = useStore(appStore, getCurrentActivityId)

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

  return (
    <SimulationFinishedActivity
      appController={appController}
      appStore={appStore}
    />
  )
}
