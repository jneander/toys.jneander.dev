import {useCallback, useEffect} from 'react'

import type {AppController} from '../app-controller'
import {ActivityId} from '../constants'
import {CreatureGrid} from '../creature-grid'
import type {AppStore} from '../types'

export interface CullCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function CullCreaturesActivity(props: CullCreaturesActivityProps) {
  const {appController, appStore} = props

  useEffect(() => {
    appController.cullCreatures()
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

  function handlePropagateClick() {
    appController.setActivityId(ActivityId.PropagateCreatures)
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
