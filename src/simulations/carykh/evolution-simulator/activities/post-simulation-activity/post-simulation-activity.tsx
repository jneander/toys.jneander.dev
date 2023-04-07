import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {useStore} from '../../../../../shared/state'
import {AppController} from '../../app-controller'
import {
  CreatureCollectionView,
  CreatureGridAdapter,
  SortingCreaturesAdapter,
} from '../../creature-collection-view'
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
      currentActivityStep: ActivityStep.SimulationFinished,
    })
  }, [])

  const activityController = useMemo(() => {
    return new ActivityController({
      activityStore,
      appController,
      appStore,
    })
  }, [activityStore, appController, appStore])

  const currentActivityStep = useStore(activityStore, getCurrentActivityStep)

  const creatureCollectionAdapter = useMemo(() => {
    if (currentActivityStep === ActivityStep.SortingCreatures) {
      return new SortingCreaturesAdapter({
        appStore,

        onAnimationFinished() {
          activityController.setCurrentActivityStep(ActivityStep.SortedCreatures)
        },
      })
    }

    return new CreatureGridAdapter({
      appController,
      appStore,

      getCreatureAndGridIndexFn(index: number) {
        return activityController.getCreatureAndGridIndex(index)
      },

      showsPopupSimulation: () => activityController.currentStepShowsPopupSimulation(),
    })
  }, [activityController, appController, appStore, currentActivityStep])

  let activityView

  if (currentActivityStep === ActivityStep.SortingCreatures) {
    activityView = <SortingCreaturesView activityController={activityController} />
  }

  if (currentActivityStep === ActivityStep.SortedCreatures) {
    activityView = (
      <SortedCreaturesView activityController={activityController} appController={appController} />
    )
  }

  if (currentActivityStep === ActivityStep.CullCreatures) {
    activityView = (
      <CullCreaturesView activityController={activityController} appController={appController} />
    )
  }

  if (currentActivityStep === ActivityStep.PropagateCreatures) {
    activityView = (
      <PropagateCreaturesView activityController={activityController} appStore={appStore} />
    )
  }

  if (currentActivityStep === ActivityStep.SimulationFinished) {
    activityView = (
      <SimulationFinishedView
        activityController={activityController}
        appController={appController}
      />
    )
  }

  return (
    <div>
      <CreatureCollectionView adapter={creatureCollectionAdapter} />

      {activityView}
    </div>
  )
}
