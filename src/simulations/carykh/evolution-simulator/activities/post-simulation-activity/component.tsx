import {Store} from '@jneander/utils-state'
import {useCallback, useMemo} from 'react'

import {useStore} from '../../../../../shared/state'
import {AppController} from '../../app-controller'
import {CreatureGrid} from '../../creature-grid'
import {P5ControlledClientView} from '../../p5-utils'
import {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'
import {CullCreaturesView} from './cull-creatures-view'
import {PropagateCreaturesView} from './propagate-creatures-view'
import {
  CreatureGridAdapter,
  SimulationFinishedView
} from './simulation-finished-view'
import {SortedCreaturesView} from './sorted-creatures-view'
import {
  SortingCreaturesAdapter,
  SortingCreaturesView
} from './sorting-creatures-view'
import type {ActivityState, ActivityStore} from './types'

import styles from './styles.module.css'

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

  const creatureGridAdapter = useMemo(() => {
    return new CreatureGridAdapter({
      activityController,
      appController,
      appStore
    })
  }, [activityController, appController, appStore])

  const sortingCreaturesAdapter = useMemo(() => {
    return new SortingCreaturesAdapter({
      activityController,
      appStore
    })
  }, [activityController, appStore])

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => activityController.getCreatureAndGridIndex(index),
    [activityController]
  )

  const currentActivityStep = useStore(activityStore, getCurrentActivityStep)

  let creatureCollectionView
  let activityView

  if (currentActivityStep === ActivityStep.SortingCreatures) {
    creatureCollectionView = (
      <P5ControlledClientView
        className={styles.Container}
        clientViewAdapter={sortingCreaturesAdapter}
      />
    )

    activityView = (
      <SortingCreaturesView activityController={activityController} />
    )
  }

  if (currentActivityStep === ActivityStep.SortedCreatures) {
    creatureCollectionView = (
      <CreatureGrid
        appController={appController}
        appStore={appStore}
        getCreatureAndGridIndexFn={getCreatureAndGridIndexFn}
        key={currentActivityStep}
        showsPopupSimulation
      />
    )

    activityView = (
      <SortedCreaturesView
        activityController={activityController}
        appController={appController}
      />
    )
  }

  if (currentActivityStep === ActivityStep.CullCreatures) {
    creatureCollectionView = (
      <CreatureGrid
        appController={appController}
        appStore={appStore}
        getCreatureAndGridIndexFn={getCreatureAndGridIndexFn}
        key={currentActivityStep}
        showsPopupSimulation
      />
    )

    activityView = (
      <CullCreaturesView
        activityController={activityController}
        appController={appController}
      />
    )
  }

  if (currentActivityStep === ActivityStep.PropagateCreatures) {
    creatureCollectionView = (
      <CreatureGrid
        appController={appController}
        appStore={appStore}
        getCreatureAndGridIndexFn={getCreatureAndGridIndexFn}
        key={currentActivityStep}
      />
    )

    activityView = (
      <PropagateCreaturesView
        activityController={activityController}
        appStore={appStore}
      />
    )
  }

  if (currentActivityStep === ActivityStep.SimulationFinished) {
    creatureCollectionView = (
      <P5ControlledClientView
        className={styles.Container}
        clientViewAdapter={creatureGridAdapter}
      />
    )

    activityView = (
      <SimulationFinishedView
        activityController={activityController}
        appController={appController}
      />
    )
  }

  return (
    <div>
      {creatureCollectionView}
      {activityView}
    </div>
  )
}
