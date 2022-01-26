import {useCallback, useEffect} from 'react'

import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreatureGrid} from '../creature-grid'
import type {AppStore} from '../types'

export interface GenerateCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function GenerateCreaturesActivity(
  props: GenerateCreaturesActivityProps
) {
  const {appController, appStore} = props

  useEffect(() => {
    appController.generateCreatures()
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
    appStore.setState({generationCount: 0})
    appController.setActivityId(ActivityId.GenerationView)
  }

  return (
    <div>
      <CreatureGrid
        appController={appController}
        appStore={appStore}
        getCreatureAndGridIndexFn={getCreatureAndGridIndexFn}
      />

      <p>Here are your {CREATURE_COUNT} randomly generated creatures!!!</p>

      <button onClick={handleBackClick} type="button">
        Back
      </button>
    </div>
  )
}
