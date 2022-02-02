import {useCallback} from 'react'

import type {AppController} from '../../app-controller'
import {ActivityId} from '../../constants'
import {CreatureGrid} from '../../creature-grid'
import {creatureIdToIndex} from '../../creatures'
import type {AppStore} from '../../types'
import type {ActivityController} from './activity-controller'

export interface SimulationFinishedActivityProps {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export function SimulationFinishedActivity(
  props: SimulationFinishedActivityProps
) {
  const {activityController, appController, appStore} = props

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => {
      const creature = appStore.getState().creaturesInLatestGeneration[index]
      const gridIndex = creatureIdToIndex(creature.id)

      return {creature, gridIndex}
    },
    [appStore]
  )

  function handleSortClick() {
    activityController.setActivityId(ActivityId.SortingCreatures)
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
