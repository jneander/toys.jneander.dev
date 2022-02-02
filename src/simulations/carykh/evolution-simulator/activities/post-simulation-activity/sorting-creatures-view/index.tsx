import {useEffect, useMemo} from 'react'

import {P5ClientView} from '../../../../../../shared/p5'
import type {AppController} from '../../../app-controller'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {ActivityStep} from '../constants'
import {SortingCreaturesP5View} from './p5-view'
import {CreateUiFnParameters, createSketchFn} from './sketch'

export interface SortingCreaturesViewProps {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export function SortingCreaturesView(props: SortingCreaturesViewProps) {
  const {activityController, appController, appStore} = props

  useEffect(() => {
    appController.sortCreatures()
    appController.updateHistory()
  }, [appController])

  const sketchFn = useMemo(() => {
    function createUiFn({p5Wrapper}: CreateUiFnParameters) {
      return new SortingCreaturesP5View({
        activityController,
        appStore,
        p5Wrapper
      })
    }

    return createSketchFn({createUiFn})
  }, [activityController, appStore])

  function handleSkipClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortedCreatures)
  }

  return (
    <div>
      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

      <button onClick={handleSkipClick} type="button">
        Skip
      </button>
    </div>
  )
}
