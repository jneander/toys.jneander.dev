import {useMemo} from 'react'

import {P5ClientView} from '../../../../../../shared/p5'
import type {AppController} from '../../../app-controller'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {ActivityStep} from '../constants'
import {CreatureGridAdapter} from './creature-grid-adapter'
import {P5ClientViewController} from './p5-client-view-controller'

import styles from './styles.module.css'

export interface SimulationFinishedViewProps {
  activityController: ActivityController
  appController: AppController
  appStore: AppStore
}

export function SimulationFinishedView(props: SimulationFinishedViewProps) {
  const {activityController, appController, appStore} = props

  const creatureGridAdapter = useMemo(() => {
    return new CreatureGridAdapter({
      activityController,
      appController,
      appStore
    })
  }, [activityController, appController, appStore])

  const viewController = useMemo(() => {
    const controller = new P5ClientViewController()

    controller.setAdapter(creatureGridAdapter)

    return controller
  }, [creatureGridAdapter])

  function handleSortClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortingCreatures)
  }

  return (
    <div>
      <P5ClientView
        className={styles.Container}
        sketch={viewController.sketch}
      />

      <p>{"All 1,000 creatures have been tested. Now let's sort them!"}</p>

      <button onClick={handleSortClick} type="button">
        Sort
      </button>
    </div>
  )
}
