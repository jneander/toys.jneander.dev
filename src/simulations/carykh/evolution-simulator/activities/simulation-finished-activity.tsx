import {useCallback} from 'react'

import type {AppController} from '../app-controller'
import {ActivityId} from '../constants'
import {creatureIdToIndex} from '../helpers'
import type {AppStore} from '../types'
import {CreatureGrid} from './creature-grid-activity'

export interface SimulationFinishedActivityProps {
  appController: AppController
  appStore: AppStore
}

export function SimulationFinishedActivity(
  props: SimulationFinishedActivityProps
) {
  const {appController, appStore} = props

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => {
      const creature = appStore.getState().creaturesInLatestGeneration[index]
      const gridIndex = creatureIdToIndex(creature.id)

      return {creature, gridIndex}
    },
    [appStore]
  )

  function handleSortClick() {
    appController.setActivityId(ActivityId.SortingCreatures)
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
