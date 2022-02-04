import {useEffect, useMemo} from 'react'

import {P5ClientView} from '../../../../../../shared/p5'
import type {AppController} from '../../../app-controller'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {ActivityStep} from '../constants'
import {ViewController} from './view-controller'

import styles from './styles.module.css'

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

  const viewController = useMemo(() => {
    return new ViewController({
      activityController,
      appStore
    })
  }, [activityController, appStore])

  function handleSkipClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortedCreatures)
  }

  return (
    <div>
      <P5ClientView
        className={styles.Container}
        sketch={viewController.sketch}
      />

      <button onClick={handleSkipClick} type="button">
        Skip
      </button>
    </div>
  )
}
