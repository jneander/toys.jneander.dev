import {useCallback, useEffect} from 'react'

import type {AppController} from '../../app-controller'
import {CREATURE_COUNT} from '../../constants'
import {CreatureGrid} from '../../creature-grid'
import type {AppStore} from '../../types'
import type {ActivityController} from './activity-controller'

export interface PropagateCreaturesViewProps {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export function PropagateCreaturesView(props: PropagateCreaturesViewProps) {
  const {activityController, appController, appStore} = props

  useEffect(() => {
    appController.propagateCreatures()
  }, [appController])

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => activityController.getCreatureAndGridIndex(index),
    [activityController]
  )

  function handleBackClick() {
    activityController.finishPostSimulation()
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
