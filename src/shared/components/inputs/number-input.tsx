import {HTMLProps} from 'react'

import styles from './styles.module.css'

interface NumberInputFieldProps
  extends Omit<HTMLProps<HTMLInputElement>, 'className' | 'label' | 'type'> {
  labelText: string
}

export function NumberInputField(props: NumberInputFieldProps) {
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
