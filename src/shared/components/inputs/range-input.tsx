import {HTMLProps} from 'react'

import styles from './styles.module.scss'

interface RangeInputFieldProps
  extends Omit<HTMLProps<HTMLInputElement>, 'className' | 'label' | 'type'> {
  labelText: string
}

export function RangeInputField(props: RangeInputFieldProps) {
  const {labelText, ...inputProps} = props

  return (
    <label className={styles.InputContainer}>
      <div className={styles.InputLabelContent}>{labelText}</div>

      <input {...inputProps} className={styles.RangeInputField} type="range" />
    </label>
  )
}
