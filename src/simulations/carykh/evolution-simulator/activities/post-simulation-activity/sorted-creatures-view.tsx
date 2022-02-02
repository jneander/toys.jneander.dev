import {useCallback} from 'react'

import type {AppController} from '../../app-controller'
import {CREATURE_COUNT} from '../../constants'
import {CreatureGrid} from '../../creature-grid'
import type {AppStore} from '../../types'
import type {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'

export interface SortedCreaturesViewProps {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export function SortedCreaturesView(props: SortedCreaturesViewProps) {
  const {activityController, appController, appStore} = props

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => activityController.getCreatureAndGridIndex(index),
    [activityController]
  )

  function handleCullClick() {
    activityController.setCurrentActivityStep(ActivityStep.CullCreatures)
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
