import {useMemo} from 'react'

import {useStore} from '../../../../../shared/state'
import {AppController} from '../../app-controller'
import {ActivityId} from '../../constants'
import {AppState, AppStore} from '../../types'
import {ActivityController} from './activity-controller'
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

  const activityController = useMemo(() => {
    return new ActivityController({
      appController
    })
  }, [appController])

  const currentActivityId = useStore(appStore, getCurrentActivityId)

  if (currentActivityId === ActivityId.SortingCreatures) {
    return (
      <SortingCreaturesActivity
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.SortedCreatures) {
    return (
      <SortedCreaturesActivity
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.CullCreatures) {
    return (
      <CullCreaturesActivity
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityId === ActivityId.PropagateCreatures) {
    return (
      <PropagateCreaturesActivity
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  return (
    <SimulationFinishedActivity
      activityController={activityController}
      appController={appController}
      appStore={appStore}
    />
  )
}
