import {useCallback, useEffect} from 'react'

import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreatureGrid} from '../creature-grid'
import type {AppStore} from '../types'

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

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => {
      return {
        creature: appStore.getState().creaturesInLatestGeneration[index],
        gridIndex: index
      }
    },
    [appStore]
  )

  function handleBackClick() {
    appController.setActivityId(ActivityId.GenerationView)
  }

  return (
    <div>
      <CreatureGrid
        appController={appController}
        appStore={appStore}
        getCreatureAndGridIndexFn={getCreatureAndGridIndexFn}
      />

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
