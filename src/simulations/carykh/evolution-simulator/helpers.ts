import {RandomNumberFn} from './types'

export function randomArrayValue<T>(
  array: T[],
  randomUint32Fn: RandomNumberFn
): T {
  return array[randomUint32Fn(0, array.length)]
}
