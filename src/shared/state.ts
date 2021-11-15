import {Store} from '@jneander/utils-state'
import {useEffect, useRef, useState} from 'react'

function getState(state: any): any {
  return state
}

function haveSameIdentity(valueA: any, valueB: any): boolean {
  return valueA === valueB
}

export function useStore<State, Substate = any>(
  store: Store<State>,
  accessorFn: (state: State) => Substate = getState,
  compareFn: (
    previous: Substate,
    current: Substate
  ) => boolean = haveSameIdentity
) {
  const accessorFnRef = useRef<typeof accessorFn>(accessorFn)
  accessorFnRef.current = accessorFn

  const compareFnRef = useRef<typeof compareFn>(compareFn)
  compareFnRef.current = compareFn

  const [value, setValue] = useState<Substate>(() =>
    accessorFn(store.getState())
  )

  const valueRef = useRef<Substate>(value)
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
