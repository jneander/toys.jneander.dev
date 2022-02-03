import {useMemo} from 'react'

import type {AppController} from '../../../app-controller'
import {P5ControlledClientView} from '../../../p5-utils'
import type {AppStore} from '../../../types'
import type {ActivityController} from '../activity-controller'
import {ActivityStep} from '../constants'
import {CreatureGridAdapter} from './creature-grid-adapter'

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

  function handleSortClick() {
    activityController.setCurrentActivityStep(ActivityStep.SortingCreatures)
  }

  return (
    <div>
      <P5ControlledClientView
        className={styles.Container}
        clientViewAdapter={creatureGridAdapter}
      />

      <p>{"All 1,000 creatures have been tested. Now let's sort them!"}</p>

      <button onClick={handleSortClick} type="button">
        Sort
      </button>
    </div>
  )
}
