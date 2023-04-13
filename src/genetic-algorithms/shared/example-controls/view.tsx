import type {IEventBus} from '@jneander/event-bus'
import type {Store} from '@jneander/utils-state'
import {ChangeEvent, useCallback} from 'react'

import {CheckboxInputField, NumberInputField, RangeInputField} from '../../../shared/components'
import {useStore} from '../../../shared/state'
import {ControlsEvent} from './constants'
import type {ControlsState} from './types'

import styles from '../styles.module.scss'

interface ExampleControlsProps {
  eventBus: IEventBus
  store: Store<ControlsState>
}

export function ExampleControls(props: ExampleControlsProps) {
  const {eventBus, store} = props

  const {
    allIterations,
    isRunning,
    iterationCount,
    maxPropagationSpeed,
    playbackPosition,
    propagationSpeed,
  } = useStore(store)

  const handleIterate = useCallback(() => {
    eventBus.publish(ControlsEvent.ITERATE)
  }, [eventBus])

  const handleRangeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const position = Number.parseInt(event.target.value, 10)
      eventBus.publish(ControlsEvent.SET_PLAYBACK_POSITION, position)
    },
    [eventBus],
  )

  const handleToggleMaxPropagationSpeed = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      eventBus.publish(ControlsEvent.SET_MAX_PROPAGATION_SPEED_ENABLED, event.target.checked)
    },
    [eventBus],
  )

  const handleChangePropagationSpeed = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const speed = Number.parseInt(event.target.value, 10)
      eventBus.publish(ControlsEvent.SET_PROPAGATION_SPEED, speed)
    },
    [eventBus],
  )

  const handleToggleRecordAllIterations = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      eventBus.publish(ControlsEvent.SET_RECORD_ALL_ITERATIONS, event.target.checked)
    },
    [eventBus],
  )

  const handleRandomize = useCallback(() => {
    eventBus.publish(ControlsEvent.RANDOMIZE)
  }, [eventBus])

  const handleStart = useCallback(() => {
    eventBus.publish(ControlsEvent.START)
  }, [eventBus])

  const handleStop = useCallback(() => {
    eventBus.publish(ControlsEvent.STOP)
  }, [eventBus])

  return (
    <div className={styles.ExampleControlsContainer}>
      <div className={styles.ExampleControlsRow}>
        <button onClick={handleRandomize}>Refresh</button>

        {isRunning ? (
          <button onClick={handleStop}>Pause</button>
        ) : (
          <button onClick={handleStart}>Start</button>
        )}

        <button disabled={isRunning} onClick={handleIterate}>
          Iterate
        </button>

        <span>
          <NumberInputField
            labelText="Iterations Per Second"
            disabled={maxPropagationSpeed}
            max={1000}
            min={1}
            onChange={handleChangePropagationSpeed}
            step={1}
            value={propagationSpeed}
          />
        </span>

        <CheckboxInputField
          checked={maxPropagationSpeed}
          id="max-speed-checkbox"
          labelText="Max Speed"
          onChange={handleToggleMaxPropagationSpeed}
        />

        <span>
          <CheckboxInputField
            checked={allIterations}
            disabled={isRunning}
            id="all-iterations-checkbox"
            labelText="Record Iterations"
            onChange={handleToggleRecordAllIterations}
          />
        </span>
      </div>

      {allIterations && (
        <RangeInputField
          disabled={isRunning}
          labelText="Iteration Range"
          max={iterationCount}
          min={1}
          onChange={handleRangeChange}
          value={playbackPosition}
        />
      )}
    </div>
  )
}
