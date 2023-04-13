import type {IEventBus} from '@jneander/event-bus'
import {ChangeEvent, useCallback} from 'react'

import {CheckboxInputField, NumberInputField, RangeInputField} from '../../../shared/components'
import {ControlsEvent} from './constants'

import styles from '../styles.module.scss'

interface ExampleControlsProps {
  eventBus: IEventBus
  maxPropagationSpeed: boolean
  onRefresh: () => void
  playing: boolean
  propagationSpeed: number
  rangePosition: number
  rangePositionCount: number
  recordAllIterations: boolean
}

export function ExampleControls(props: ExampleControlsProps) {
  const {eventBus} = props

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

  const handleStart = useCallback(() => {
    eventBus.publish(ControlsEvent.START)
  }, [eventBus])

  const handleStop = useCallback(() => {
    eventBus.publish(ControlsEvent.STOP)
  }, [eventBus])

  return (
    <div className={styles.ExampleControlsContainer}>
      <div className={styles.ExampleControlsRow}>
        <button onClick={props.onRefresh}>Refresh</button>

        {props.playing ? (
          <button onClick={handleStop}>Pause</button>
        ) : (
          <button onClick={handleStart}>Start</button>
        )}

        <button disabled={props.playing} onClick={handleIterate}>
          Iterate
        </button>

        <span>
          <NumberInputField
            labelText="Iterations Per Second"
            disabled={props.maxPropagationSpeed}
            max={1000}
            min={1}
            onChange={handleChangePropagationSpeed}
            step={1}
            value={props.propagationSpeed}
          />
        </span>

        <CheckboxInputField
          checked={props.maxPropagationSpeed}
          id="max-speed-checkbox"
          labelText="Max Speed"
          onChange={handleToggleMaxPropagationSpeed}
        />

        <span>
          <CheckboxInputField
            checked={props.recordAllIterations}
            disabled={props.playing}
            id="all-iterations-checkbox"
            labelText="Record Iterations"
            onChange={handleToggleRecordAllIterations}
          />
        </span>
      </div>

      {props.recordAllIterations && (
        <RangeInputField
          disabled={props.playing}
          labelText="Iteration Range"
          max={props.rangePositionCount}
          min={1}
          onChange={handleRangeChange}
          value={props.rangePosition}
        />
      )}
    </div>
  )
}
