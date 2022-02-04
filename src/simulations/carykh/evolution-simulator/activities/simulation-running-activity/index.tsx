import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {P5ClientView} from '../../../../../shared/p5'
import {useStore} from '../../../../../shared/state'
import type {AppController} from '../../app-controller'
import {SIMULATION_SPEED_INITIAL} from '../../constants'
import type {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {SimulationRunningP5Ui} from './simulation-running-p5-ui'
import {CreateUiFnParameters, createSketchFn} from './sketch'
import type {ActivityState} from './types'

import styles from './styles.module.css'

export interface SimulationRunningActivityProps {
  appController: AppController
  appStore: AppStore
}

function getSimulationSpeed(activityState: ActivityState): number {
  return activityState.simulationSpeed
}

export function SimulationRunningActivity(
  props: SimulationRunningActivityProps
) {
  const {appController, appStore} = props

  const activityStore = useMemo(() => {
    return new Store<ActivityState>({
      simulationSpeed: SIMULATION_SPEED_INITIAL,
      timer: 0
    })
  }, [])

  const activityController = useMemo(() => {
    return new ActivityController({activityStore, appController, appStore})
  }, [activityStore, appController, appStore])

  const sketchFn = useMemo(() => {
    function createUiFn({p5Wrapper}: CreateUiFnParameters) {
      return new SimulationRunningP5Ui({
        activityController,
        appController,
        p5Wrapper
      })
    }

    return createSketchFn({createUiFn})
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
        <P5ClientView sketch={sketchFn} />
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
