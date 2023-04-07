import {randomInt} from '@jneander/genetics'
import {useMemo} from 'react'

const idValues = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function randomId() {
  return Array(8)
    .fill(0)
    .map(_ => idValues[randomInt(0, idValues.length)])
    .join('')
}

export function useId(id?: string | number): string {
  return useMemo(() => String(id ?? randomId()), [id])
}
