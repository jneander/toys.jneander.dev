import type {EventBus} from '@jneander/event-bus'

import {useStore} from '../../../shared/state'
import {ChessBoard, ExampleControls, Metrics} from '../../shared'
import type {Controller} from '../controller'
import {Configuration} from './configuration'

interface KnightCoveringProps {
  controller: Controller
  eventBus: EventBus
}

export function KnightCovering(props: KnightCoveringProps) {
  const {controller, eventBus} = props

  const state = useStore(controller.store)

  function handleBoardSizeChange(size: number) {
    controller.setBoardSize(size)
  }

  return (
    <div className="flow">
      <ExampleControls
        eventBus={eventBus}
        maxPropagationSpeed={state.maxPropagationSpeed}
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
