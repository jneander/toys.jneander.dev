import {useCallback} from 'react'

import type {AppController} from '../../app-controller'
import {ActivityId, CREATURE_COUNT} from '../../constants'
import {CreatureGrid} from '../../creature-grid'
import type {AppStore} from '../../types'

export interface SortedCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function SortedCreaturesActivity(props: SortedCreaturesActivityProps) {
  const {appController, appStore} = props

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => {
      return {
        creature: appStore.getState().creaturesInLatestGeneration[index],
        gridIndex: index
      }
    },
    [appStore]
  )

  function handleCullClick() {
    appController.setActivityId(ActivityId.CullCreatures)
  }

  return (
    <div>
      <CreatureGrid
        appController={appController}
        appStore={appStore}
        getCreatureAndGridIndexFn={getCreatureAndGridIndexFn}
        showsPopupSimulation
      />

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
