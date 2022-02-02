import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {useStore} from '../../../../../shared/state'
import {AppController} from '../../app-controller'
import {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'
import {CullCreaturesView} from './cull-creatures-view'
import {PropagateCreaturesView} from './propagate-creatures-view'
import {SimulationFinishedView} from './simulation-finished-view'
import {SortedCreaturesView} from './sorted-creatures-view'
import {SortingCreaturesView} from './sorting-creatures-view'
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
      appController,
      appStore
    })
  }, [activityStore, appController, appStore])

  const currentActivityStep = useStore(activityStore, getCurrentActivityStep)

  if (currentActivityStep === ActivityStep.SortingCreatures) {
    return (
      <SortingCreaturesView
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityStep === ActivityStep.SortedCreatures) {
    return (
      <SortedCreaturesView
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityStep === ActivityStep.CullCreatures) {
    return (
      <CullCreaturesView
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityStep === ActivityStep.PropagateCreatures) {
    return (
      <PropagateCreaturesView
        activityController={activityController}
        appController={appController}
        appStore={appStore}
      />
    )
  }

  return (
    <SimulationFinishedView
      activityController={activityController}
      appController={appController}
      appStore={appStore}
    />
  )
}
