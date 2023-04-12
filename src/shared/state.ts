import {Store} from '@jneander/utils-state'
import {useCallback, useSyncExternalStore} from 'react'

function getState(state: unknown): unknown {
  return state
}

export function useStore<State extends Record<string, unknown>>(store: Store<State>): State
export function useStore<State extends Record<string, unknown>, T>(
  store: Store<State>,
  accessorFn: (state: State) => T,
): T
export function useStore<State extends Record<string, unknown>>(
  store: Store<State>,
  accessorFn = getState,
) {
  const subscribe = useCallback((listenerFn: () => void) => store.subscribe(listenerFn), [store])

  const getState = useCallback(() => {
    const state = store.getState()
    return accessorFn ? accessorFn(state) : state
  }, [accessorFn, store])

  return useSyncExternalStore(subscribe, getState)
}
