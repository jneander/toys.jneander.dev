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
        onPause={controller.stop}
        onPositionChange={handlePositionChange}
        onRefresh={controller.randomizeTarget}
        onStart={controller.start}
        onSetRecordAllIterations={controller.setRecordAllIterations}
        playing={state.isRunning}
        rangePosition={state.playbackPosition}
        rangePositionCount={state.iterationCount}
        recordAllIterations={state.allIterations}
      />

      <Metrics iteration={state.current?.iteration ?? 0} />

      <div className={styles.Dunno}>
        {state.current && <Cards label="Current" chromosome={state.current} />}

        {state.best && <Cards label="Best" chromosome={state.best} />}
      </div>
    </div>
  )
}
