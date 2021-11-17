import {randomInt} from '@jneander/genetics'
import {HTMLProps, useMemo} from 'react'

import styles from './styles.module.css'

const idValues =
  '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomId() {
  return Array(8)
    .fill(0)
    .map(_ => idValues[randomInt(0, idValues.length)])
    .join('')
}

interface CheckboxInputFieldProps
  extends Omit<HTMLProps<HTMLInputElement>, 'className' | 'label' | 'type'> {
  labelText: string
}

export function CheckboxInputField(props: CheckboxInputFieldProps) {
  const {labelText, ...inputProps} = props

  const id = useMemo(() => props.id ?? randomId(), [props.id])

  return (
    <div className={styles.CheckboxInputField}>
      <input {...inputProps} id={id} type="checkbox" />

      <label htmlFor={id}>{labelText}</label>
    </div>
  )
}
