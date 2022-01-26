import {useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {CreatureGridP5Activity} from './creature-grid-activity'

export interface SortedCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function SortedCreaturesActivity(props: SortedCreaturesActivityProps) {
  const {appController, appStore} = props

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
        gridStartY: 42
      })
    }

    return createSketchFn({createActivityFn})
  }, [appController, appStore])

  function handleCullClick() {
    appController.setActivityId(ActivityId.CullCreatures)
  }

  return (
    <div>
      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

      <p>
        Fastest creatures at the top! Slowest creatures at the bottom. (Going
        backward = slow)
      </p>

      <button onClick={handleCullClick} type="button">
        Kill {Math.floor(CREATURE_COUNT / 2)}
      </button>
    </div>
  )
}
