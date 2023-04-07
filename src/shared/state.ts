import {Store} from '@jneander/utils-state'
import {useEffect, useRef, useState} from 'react'

function getState(state: unknown): unknown {
  return state
}

function haveSameIdentity(valueA: unknown, valueB: unknown): boolean {
  return valueA === valueB
}

export function useStore<State extends Record<string, unknown>>(store: Store<State>): State
export function useStore<State extends Record<string, unknown>>(
  store: Store<State>,
  accessorFn: (state: State) => unknown,
): ReturnType<typeof accessorFn>
export function useStore<State extends Record<string, unknown>>(
  store: Store<State>,
  accessorFn: (state: State) => unknown,
  compareFn: (
    previous: ReturnType<typeof accessorFn>,
    current: ReturnType<typeof accessorFn>,
  ) => boolean,
): ReturnType<typeof accessorFn>
export function useStore<State extends Record<string, unknown>>(
  store: Store<State>,
  accessorFn = getState,
  compareFn: (
    previous: ReturnType<typeof accessorFn>,
    current: ReturnType<typeof accessorFn>,
  ) => boolean = haveSameIdentity,
): ReturnType<typeof accessorFn> {
  const accessorFnRef = useRef<typeof accessorFn>(accessorFn)
  accessorFnRef.current = accessorFn

  const compareFnRef = useRef<typeof compareFn>(compareFn)
  compareFnRef.current = compareFn

  const [value, setValue] = useState<ReturnType<typeof accessorFn>>(() =>
    accessorFn(store.getState()),
  )

  const valueRef = useRef<ReturnType<typeof accessorFn>>(value)
  valueRef.current = value

  useEffect(() => {
    const newValue = accessorFnRef.current(store.getState())

    if (!compareFnRef.current(newValue, valueRef.current)) {
      setValue(newValue)
    }

    return store.subscribe(state => {
      const newValue = accessorFnRef.current(state)

      if (!compareFnRef.current(newValue, valueRef.current)) {
        setValue(newValue)
      }
    })
  }, [store])

  return value
}
