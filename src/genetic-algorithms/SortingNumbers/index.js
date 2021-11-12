import {useEffect, useMemo} from 'react'

import {useStore} from '../../shared/state'
import ChromosomeTable from '../shared/ChromosomeTable'
import ExampleControls from '../shared/ExampleControls'
import Controller from './Controller'

export default function SortingNumbers() {
  const controller = useMemo(() => {
    return new Controller()
  }, [])

  const state = useStore(controller.store)

  useEffect(() => {
    controller.initialize()
  }, [controller])

  function handlePositionChange(position) {
    controller.setPlaybackPosition(position)
  }

  return (
    <div>
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
          formatGenes={genes => genes.join(', ')}
          target={state.target}
        />
      </div>
    </div>
  )
}
