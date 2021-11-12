import {randomInt} from '@jneander/genetics'
import {useMemo} from 'react'

import styles from './styles.module.css'

const idValues =
  '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomId() {
  return Array(8)
    .fill()
    .map(_ => idValues[randomInt(0, idValues.length)])
    .join('')
}

export function CheckboxInputField(props) {
  const {labelText, ...inputProps} = props

  const id = useMemo(() => props.id ?? randomId(), [props.id])

  return (
    <div className={styles.CheckboxInputField}>
      <input {...inputProps} id={id} type="checkbox" />

      <label htmlFor={id}>{labelText}</label>
    </div>
  )
}
