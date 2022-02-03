import {useCallback, useEffect, useMemo, useRef} from 'react'

import type {AppController} from '../../../app-controller'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {ActivityStep} from '../constants'
import {ViewController} from './view-controller'

import styles from './styles.module.css'

export interface SimulationFinishedViewProps {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export function SimulationFinishedView(props: SimulationFinishedViewProps) {
  const {activityController, appController, appStore} = props

  const containerRef = useRef(null)

  const getCreatureAndGridIndexFn = useCallback(
    (index: number) => activityController.getCreatureAndGridIndex(index),
    [activityController]
  )

  const viewController = useMemo(() => {
    return new ViewController({
      appController,
      appStore,
      getCreatureAndGridIndexFn
    })
  }, [appController, appStore, getCreatureAndGridIndexFn])

  useEffect(() => {
    viewController.initialize(containerRef.current!)

    return () => {
      viewController.deinitialize()
    }
  }, [viewController])

  function handleSortClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortingCreatures)
  }

  return (
    <div>
      <div className={styles.Container} ref={containerRef} />

      <p>{"All 1,000 creatures have been tested. Now let's sort them!"}</p>

      <button onClick={handleSortClick} type="button">
        Sort
      </button>
    </div>
  )
}
