import {useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId} from '../constants'
import {creatureIdToIndex} from '../helpers'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {CreatureGridP5Activity} from './creature-grid-activity'

export interface SimulationFinishedActivityProps {
  appController: AppController
  appStore: AppStore
}

export function SimulationFinishedActivity(
  props: SimulationFinishedActivityProps
) {
  const {appController, appStore} = props

  const sketchFn = useMemo(() => {
    function getCreatureAndGridIndexFn(index: number) {
      const creature = appStore.getState().creaturesInLatestGeneration[index]
      const gridIndex = creatureIdToIndex(creature.id)

      return {creature, gridIndex}
    }

    function createActivityFn({appView}: CreateActivityFnParameters) {
      return new CreatureGridP5Activity({
        appController,
        appStore,
        appView,
        getCreatureAndGridIndexFn,
        gridStartX: 40,
        gridStartY: 17
      })
    }

    return createSketchFn({createActivityFn})
  }, [appController, appStore])

  function handleSortClick() {
    appController.setActivityId(ActivityId.SortingCreatures)
  }

  return (
    <div>
      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

      <p>{"All 1,000 creatures have been tested. Now let's sort them!"}</p>

      <button onClick={handleSortClick} type="button">
        Sort
      </button>
    </div>
  )
}
