import {useEffect, useMemo} from 'react'

import {useStore} from '../../shared/state'
import {ExampleControls, Metrics} from '../shared'
import Cards from './Cards'
import Controller from './Controller'

import styles from './styles.module.css'

export default function CardSplitting() {
  const controller = useMemo(() => {
    return new Controller()
  }, [])

  const state = useStore(controller.store)

  useEffect(() => {
    controller.initialize()
  }, [controller])

  function handlePositionChange(position: number) {
    controller.setPlaybackPosition(position)
  }

  return (
    <div className={styles.Container}>
      <ExampleControls
        maxPropagationSpeed={state.maxPropagationSpeed}
        onIterate={controller.iterate}
        onPause={controller.stop}
        onPositionChange={handlePositionChange}
        onRefresh={controller.randomizeTarget}
        onSetMaxPropagationSpeed={controller.setMaxPropagationSpeed}
        onSetPropagationSpeed={controller.setPropagationSpeed}
        onSetRecordAllIterations={controller.setRecordAllIterations}
        onStart={controller.start}
        playing={state.isRunning}
        propagationSpeed={state.propagationSpeed}
        rangePosition={state.playbackPosition}
        rangePositionCount={state.iterationCount}
        recordAllIterations={state.allIterations}
      />

      <Metrics iteration={state.current?.iteration ?? 0} />

      <div className={styles.Dunno}>
        {state.current && <Cards label="Current" record={state.current} />}

        {state.best && <Cards label="Best" record={state.best} />}
      </div>
    </div>
  )
}
