import {randomStringValue} from '@jneander/utils-random'

const idValues = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function randomId() {
  return Array(8)
    .fill(0)
    .map(_ => randomStringValue(idValues))
    .join('')
}
