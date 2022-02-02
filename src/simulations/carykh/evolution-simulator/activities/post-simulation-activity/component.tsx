import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {useStore} from '../../../../../shared/state'
import {AppController} from '../../app-controller'
import {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'
import {CullCreaturesActivity} from './cull-creatures-activity'
import {PropagateCreaturesActivity} from './propagate-creatures-activity'
import {SimulationFinishedActivity} from './simulation-finished-activity'
import {SortedCreaturesActivity} from './sorted-creatures-activity'
import {SortingCreaturesActivity} from './sorting-creatures-activity'
import type {ActivityState, ActivityStore} from './types'

function getCurrentActivityStep(activityState: ActivityState): ActivityStep {
  return activityState.currentActivityStep
}

export interface PostSimulationActivityProps {
  appController: AppController
  appStore: AppStore
}

export function PostSimulationActivity(props: PostSimulationActivityProps) {
  const {appController, appStore} = props

  const activityStore = useMemo<ActivityStore>(() => {
    return new Store<ActivityState>({
      currentActivityStep: ActivityStep.SimulationFinished
    })
  }, [])

  const activityController = useMemo(() => {
    return new ActivityController({
      activityStore,
      appController
    })
  }, [activityStore, appController])

  const currentActivityStep = useStore(activityStore, getCurrentActivityStep)

  if (currentActivityStep === ActivityStep.SortingCreatures) {
    return (
      <SortingCreaturesActivity
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityStep === ActivityStep.SortedCreatures) {
    return (
      <SortedCreaturesActivity
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityStep === ActivityStep.CullCreatures) {
    return (
      <CullCreaturesActivity
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityStep === ActivityStep.PropagateCreatures) {
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
