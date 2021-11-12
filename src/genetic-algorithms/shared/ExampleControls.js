import {CheckboxInputField, RangeInputField} from '../../shared/components'

import styles from './styles.module.css'

export default function ExampleControls(props) {
  function handleRangeChange(event) {
    props.onPositionChange(Number.parseInt(event.target.value, 10))
  }

  function handleToggleRecordAllIterations(event) {
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

        <span>
          <CheckboxInputField
            id="all-iterations-checkbox"
            labelText="All Iterations"
            checked={props.recordAllIterations}
            disabled={props.playing}
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

ExampleControls.defaultProps = {
  onSetRecordAllIterations() {}
}
