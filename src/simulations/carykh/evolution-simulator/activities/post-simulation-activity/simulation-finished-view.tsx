import {useCallback} from 'react'

import type {AppController} from '../../app-controller'
import {CreatureGrid} from '../../creature-grid'
import type {AppStore} from '../../types'
import type {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'

export interface SimulationFinishedViewProps {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export function SimulationFinishedView(props: SimulationFinishedViewProps) {
  const {activityController, appController, appStore} = props

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => activityController.getCreatureAndGridIndex(index),
    [activityController]
  )

  function handleSortClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortingCreatures)
  }

  return (
    <div>
      <CreatureGrid
        appController={appController}
        appStore={appStore}
        getCreatureAndGridIndexFn={getCreatureAndGridIndexFn}
        showsPopupSimulation
      />

      <p>{"All 1,000 creatures have been tested. Now let's sort them!"}</p>

      <button onClick={handleSortClick} type="button">
        Sort
      </button>
    </div>
  )
}
