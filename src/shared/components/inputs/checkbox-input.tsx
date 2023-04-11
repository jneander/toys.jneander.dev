import {HTMLProps} from 'react'

import {useId} from '../../utils'

import styles from './styles.module.scss'

interface CheckboxInputFieldProps
  extends Omit<HTMLProps<HTMLInputElement>, 'className' | 'label' | 'type'> {
  labelText: string
}

export function CheckboxInputField(props: CheckboxInputFieldProps) {
  const {labelText, ...inputProps} = props

  const id = useId(props.id)

  return (
    <div className={styles.CheckboxInputField}>
      <input {...inputProps} id={id} type="checkbox" />

      <label htmlFor={id}>{labelText}</label>
    </div>
  )
}
