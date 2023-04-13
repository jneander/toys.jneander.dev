import {EventBus} from '@jneander/event-bus'
import {useEffect, useMemo} from 'react'

import {useStore} from '../../../shared/state'
import {ChessBoard, ExampleControls, Metrics} from '../../shared'
import {Controller} from '../controller'
import {Configuration} from './configuration'

export function KnightCovering() {
  const eventBus = useMemo(() => {
    return new EventBus()
  }, [])

  const controller = useMemo(() => {
    return new Controller(eventBus)
  }, [eventBus])

  const state = useStore(controller.store)

  useEffect(() => {
    controller.initialize()
    return controller.deinitialize.bind(controller)
  }, [controller])

  function handleBoardSizeChange(size: number) {
    controller.setBoardSize(size)
  }

  return (
    <div className="flow">
      <ExampleControls
        eventBus={eventBus}
        maxPropagationSpeed={state.maxPropagationSpeed}
        onIterate={controller.iterate}
        onPause={controller.stop}
        onRefresh={controller.randomizeTarget}
        onSetRecordAllIterations={controller.setRecordAllIterations}
        onStart={controller.start}
        playing={state.isRunning}
        propagationSpeed={state.propagationSpeed}
        rangePosition={state.playbackPosition}
        rangePositionCount={state.iterationCount}
        recordAllIterations={state.allIterations}
      />

      <Configuration
        boardSize={controller.boardSize}
        disabled={state.isRunning}
        onBoardSizeChange={handleBoardSizeChange}
      />

      <Metrics iteration={state.current ? state.current.iteration : 0} />

      <div>
        <ChessBoard positions={state.current?.chromosome?.genes} size={controller.boardSize} />
      </div>
    </div>
  )
}
