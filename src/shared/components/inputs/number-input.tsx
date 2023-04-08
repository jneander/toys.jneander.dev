import {HTMLProps} from 'react'

import styles from './styles.module.scss'

interface NumberInputFieldProps
  extends Omit<HTMLProps<HTMLInputElement>, 'className' | 'label' | 'type' | 'checked'> {
  labelText: string
}

export function NumberInputField(props: NumberInputFieldProps) {
  const {labelText, ...inputProps} = props

  return (
    <label className={styles.InputContainer}>
      <div className={styles.InputLabelContent}>{labelText}</div>

      <input {...inputProps} className={styles.NumberInputField} type="number" />
    </label>
  )
}
