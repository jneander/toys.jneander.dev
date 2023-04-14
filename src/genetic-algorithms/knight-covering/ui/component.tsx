import type {EventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'

import {useStore} from '../../../shared/state'
import {
  ChessBoard,
  ChessBoardPosition,
  ControlsState,
  ExampleControls,
  Metrics,
  State,
} from '../../shared'
import type {Controller} from '../controller'
import {Configuration} from './configuration'

interface KnightCoveringProps {
  controller: Controller
  controlsStore: Store<ControlsState>
  eventBus: EventBus
  store: Store<State<ChessBoardPosition, number>>
}

export function KnightCovering(props: KnightCoveringProps) {
  const {controller, controlsStore, eventBus, store} = props

  const state = useStore(store)
  const {isRunning} = useStore(controlsStore)

  function handleBoardSizeChange(size: number) {
    controller.setBoardSize(size)
  }

  return (
    <>
      <ExampleControls eventBus={eventBus} store={controlsStore} />

      <Configuration
        boardSize={controller.boardSize}
        disabled={isRunning}
        onBoardSizeChange={handleBoardSizeChange}
      />

      <Metrics iteration={state.current ? state.current.iteration : 0} />

      <div>
        <ChessBoard positions={state.current?.chromosome?.genes} size={controller.boardSize} />
      </div>
    </>
  )
}
