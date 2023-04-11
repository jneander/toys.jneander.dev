import {randomStringValue} from '@jneander/utils-random'
import {useMemo} from 'react'

const idValues = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function randomId() {
  return Array(8)
    .fill(0)
    .map(_ => randomStringValue(idValues))
    .join('')
}

export function useId(id?: string | number): string {
  return useMemo(() => String(id ?? randomId()), [id])
}
