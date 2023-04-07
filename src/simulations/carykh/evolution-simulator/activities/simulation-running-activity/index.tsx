import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {useStore} from '../../../../../shared/state'
import type {AppController} from '../../app-controller'
import {SIMULATION_SPEED_INITIAL} from '../../constants'
import {P5ControlledClientView} from '../../p5-utils'
import type {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {SimulationRunningAdapter} from './simulation-running-adapter'
import type {ActivityState} from './types'

import styles from './styles.module.css'

export interface SimulationRunningActivityProps {
  appController: AppController
  appStore: AppStore
}

function getSimulationSpeed(activityState: ActivityState): number {
  return activityState.simulationSpeed
}

export function SimulationRunningActivity(props: SimulationRunningActivityProps) {
  const {appController, appStore} = props

  const activityStore = useMemo(() => {
    return new Store<ActivityState>({
      simulationSpeed: SIMULATION_SPEED_INITIAL,
      timer: 0,
    })
  }, [])

  const activityController = useMemo(() => {
    return new ActivityController({activityStore, appController, appStore})
  }, [activityStore, appController, appStore])

  const clientViewAdapter = useMemo(() => {
    return new SimulationRunningAdapter({
      activityController,
      appController,
    })
  }, [activityController, appController])

  const simulationSpeed = useStore(activityStore, getSimulationSpeed)

  function handleSkipClick() {
    activityController.advanceGenerationSimulation()
  }

  function handlePlaybackSpeedClick() {
    activityController.increaseSimulationSpeed()
  }

  function handleFinishClick() {
    activityController.finishGenerationSimulation()
  }

  return (
    <div>
      <div className={styles.Container}>
        <P5ControlledClientView clientViewAdapter={clientViewAdapter} />
      </div>

      <button onClick={handleSkipClick} type="button">
        Skip
      </button>

      <button onClick={handlePlaybackSpeedClick} type="button">
        Playback Speed: x{simulationSpeed}
      </button>

      <button onClick={handleFinishClick} type="button">
        Finish
      </button>
    </div>
  )
}
