import {useEffect, useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {CreatureGridP5Activity} from './creature-grid-activity'

export interface PropagateCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function PropagateCreaturesActivity(
  props: PropagateCreaturesActivityProps
) {
  const {appController, appStore} = props

  useEffect(() => {
    appController.propagateCreatures()
  }, [appController])

  const sketchFn = useMemo(() => {
    function getCreatureAndGridIndexFn(index: number) {
      return {
        creature: appStore.getState().creaturesInLatestGeneration[index],
        gridIndex: index
      }
    }

    function createActivityFn({appView}: CreateActivityFnParameters) {
      return new CreatureGridP5Activity({
        appController,
        appStore,
        appView,
        getCreatureAndGridIndexFn,
        gridStartX: 40,
        gridStartY: 42,
        showsPopupSimulation: false
      })
    }

    return createSketchFn({createActivityFn})
  }, [appController, appStore])

  function handleBackClick() {
    appController.setActivityId(ActivityId.GenerationView)
  }

  return (
    <div>
      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

      <p>
        These are the {CREATURE_COUNT} creatures of generation #
        {appStore.getState().generationCount + 1}.
      </p>

      <p>What perils will they face? Find out next time!</p>

      <button onClick={handleBackClick} type="button">
        Back
      </button>
    </div>
  )
}
