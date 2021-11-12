import {useEffect, useRef, useState} from 'react'

function getState(state) {
  return state
}

function haveSameIdentity(valueA, valueB) {
  return valueA === valueB
}

export function useStore(
  store,
  accessorFn = getState,
  compareFn = haveSameIdentity
) {
  const accessorFnRef = useRef(accessorFn)
  accessorFnRef.current = accessorFn

  const compareFnRef = useRef(compareFn)
  compareFnRef.current = compareFn

  const [value, setValue] = useState(() => accessorFn(store.getState()))

  const valueRef = useRef(value)
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
