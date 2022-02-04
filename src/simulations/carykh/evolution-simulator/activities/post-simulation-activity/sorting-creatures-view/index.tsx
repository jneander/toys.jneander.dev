import {useMemo} from 'react'

import type {AppController} from '../../../app-controller'
import {P5ControlledClientView} from '../../../p5-utils'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {ActivityStep} from '../constants'
import {SortingCreaturesAdapter} from './sorting-creatures-adapter'

import styles from './styles.module.css'

export interface SortingCreaturesViewProps {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export function SortingCreaturesView(props: SortingCreaturesViewProps) {
  const {activityController, appStore} = props

  const sortingCreaturesAdapter = useMemo(() => {
    return new SortingCreaturesAdapter({
      activityController,
      appStore
    })
  }, [activityController, appStore])

  function handleSkipClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortedCreatures)
  }

  return (
    <div>
      <P5ControlledClientView
        className={styles.Container}
        clientViewAdapter={sortingCreaturesAdapter}
      />

      <button onClick={handleSkipClick} type="button">
        Skip
      </button>
    </div>
  )
}
