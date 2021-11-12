import styles from './styles.module.css'

export function RangeInputField(props) {
  const {labelText, ...inputProps} = props

  return (
    <label className={styles.InputContainer}>
      <div className={styles.InputLabelContent}>{labelText}</div>

      <input {...inputProps} className={styles.RangeInputField} type="range" />
    </label>
  )
}
