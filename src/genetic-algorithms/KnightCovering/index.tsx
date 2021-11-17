import {useEffect, useMemo} from 'react'

import {useStore} from '../../shared/state'
import {ExampleControls} from '../shared'
import Board from './Board'
import Configuration from './Configuration'
import Controller from './Controller'
import Metrics from './Metrics'

import styles from './styles.module.css'

export default function KnightCovering() {
  const controller = useMemo(() => {
    return new Controller()
  }, [])

  const state = useStore(controller.store)

  useEffect(() => {
    controller.initialize()
  }, [controller])

  function handleBoardSizeChange(size: number) {
    controller.setBoardSize(size)
  }

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

      <Configuration
        boardSize={state.boardSize}
        disabled={state.isRunning}
        onBoardSizeChange={handleBoardSizeChange}
      />

      <Metrics iteration={state.current ? state.current.iteration : 0} />

      <div>
        <Board chromosome={state.current} size={state.boardSize} />
      </div>
    </div>
  )
}
