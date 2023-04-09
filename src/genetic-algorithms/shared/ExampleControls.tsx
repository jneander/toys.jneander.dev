import {ChangeEvent} from 'react'

import {CheckboxInputField, NumberInputField, RangeInputField} from '../../shared/components'

import styles from './styles.module.scss'

interface ExampleControlsProps {
  maxPropagationSpeed: boolean
  onIterate: () => void
  onPause: () => void
  onPositionChange: (position: number) => void
  onRefresh: () => void
  onSetMaxPropagationSpeed: (maxPropagationSpeed: boolean) => void
  onSetPropagationSpeed: (propagationSpeed: number) => void
  onSetRecordAllIterations: (record: boolean) => void
  onStart: () => void
  playing: boolean
  propagationSpeed: number
  rangePosition: number
  rangePositionCount: number
  recordAllIterations: boolean
}

export function ExampleControls(props: ExampleControlsProps) {
  function handleRangeChange(event: ChangeEvent<HTMLInputElement>) {
    props.onPositionChange(Number.parseInt(event.target.value, 10))
  }

  function handleToggleMaxPropagationSpeed(event: ChangeEvent<HTMLInputElement>) {
    props.onSetMaxPropagationSpeed(event.target.checked)
  }

  function handleChangePropagationSpeed(event: ChangeEvent<HTMLInputElement>) {
    props.onSetPropagationSpeed(Number.parseInt(event.target.value, 10))
  }

  function handleToggleRecordAllIterations(event: ChangeEvent<HTMLInputElement>) {
    props.onSetRecordAllIterations(event.target.checked)
  }

  return (
    <div className={styles.ExampleControlsContainer}>
      <div className={styles.ExampleControlsRow}>
        <button onClick={props.onRefresh}>Refresh</button>

        {props.playing ? (
          <button onClick={props.onPause}>Pause</button>
        ) : (
          <button onClick={props.onStart}>Start</button>
        )}

        <button disabled={props.playing} onClick={props.onIterate}>
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
