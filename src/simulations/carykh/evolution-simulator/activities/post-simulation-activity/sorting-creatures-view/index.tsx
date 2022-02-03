import {useEffect, useMemo, useRef} from 'react'

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

  const containerRef = useRef(null)

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

  useEffect(() => {
    viewController.initialize(containerRef.current!)

    return () => {
      viewController.deinitialize()
    }
  }, [viewController])

  function handleSkipClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortedCreatures)
  }

  return (
    <div>
      <div className={styles.Container} ref={containerRef} />

      <button onClick={handleSkipClick} type="button">
        Skip
      </button>
    </div>
  )
}
