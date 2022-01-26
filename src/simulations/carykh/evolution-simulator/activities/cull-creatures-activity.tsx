import {useEffect, useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId} from '../constants'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {CreatureGridP5Activity} from './creature-grid-activity'

export interface CullCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function CullCreaturesActivity(props: CullCreaturesActivityProps) {
  const {appController, appStore} = props

  useEffect(() => {
    appController.cullCreatures()
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
        gridStartY: 42
      })
    }

    return createSketchFn({createActivityFn})
  }, [appController, appStore])

  function handlePropagateClick() {
    appController.setActivityId(ActivityId.PropagateCreatures)
  }

  return (
    <div>
      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

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
