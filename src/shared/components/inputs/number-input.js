import styles from './styles.module.css'

export function NumberInputField(props) {
  const {labelText, ...inputProps} = props

  return (
    <label className={styles.InputContainer}>
      <div className={styles.InputLabelContent}>{labelText}</div>

      <input
        {...inputProps}
        className={styles.NumberInputField}
        type="number"
      />
    </label>
  )
}
