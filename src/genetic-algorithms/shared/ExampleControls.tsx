import {ChangeEvent} from 'react'

import {CheckboxInputField, RangeInputField} from '../../shared/components'

import styles from './styles.module.css'

interface ExampleControlsProps {
  onPause: () => void
  onPositionChange: (position: number) => void
  onRefresh: () => void
  onSetRecordAllIterations?: (record: boolean) => void
  onStart: () => void
  playing: boolean
  rangePosition: number
  rangePositionCount: number
  recordAllIterations: boolean
}

export default function ExampleControls(props: ExampleControlsProps) {
  function handleRangeChange(event: ChangeEvent<HTMLInputElement>) {
    props.onPositionChange(Number.parseInt(event.target.value, 10))
  }

  function handleToggleRecordAllIterations(
    event: ChangeEvent<HTMLInputElement>
  ) {
    props.onSetRecordAllIterations?.(event.target.checked)
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
