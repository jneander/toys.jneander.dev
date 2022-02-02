import {useCallback, useEffect} from 'react'

import type {AppController} from '../../app-controller'
import {CreatureGrid} from '../../creature-grid'
import type {AppStore} from '../../types'
import type {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'

export interface CullCreaturesViewProps {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export function CullCreaturesView(props: CullCreaturesViewProps) {
  const {activityController, appController, appStore} = props

  useEffect(() => {
    appController.cullCreatures()
  }, [appController])

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => activityController.getCreatureAndGridIndex(index),
    [activityController]
  )

  function handlePropagateClick() {
    activityController.setCurrentActivityStep(ActivityStep.PropagateCreatures)
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
        Faster creatures are more likely to survive because they can outrun
        their predators. Slow creatures get eaten.
      </p>

      <p>
        Because of random chance, a few fast ones get eaten, while a few slow
        ones survive.
      </p>

      <button onClick={handlePropagateClick} type="button">
        Reproduce
      </button>
    </div>
  )
}
