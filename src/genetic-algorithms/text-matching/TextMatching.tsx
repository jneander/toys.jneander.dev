import {useEffect, useMemo} from 'react'

import {useStore} from '../../shared/state'
import {ChromosomeTable, ExampleControls} from '../shared'
import Controller from './Controller'

import styles from './styles.module.css'

export default function TextMatching() {
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

      <div>
        <ChromosomeTable
          best={state.best}
          current={state.current}
          first={state.first}
          formatGenes={genes => genes.join('')}
          target={state.target}
        />
      </div>
    </div>
  )
}
