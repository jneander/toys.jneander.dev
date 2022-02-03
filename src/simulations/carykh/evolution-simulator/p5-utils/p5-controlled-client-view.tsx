import {useEffect, useMemo} from 'react'

import {P5ClientView, P5ClientViewProps} from '../../../../shared/p5'
import {P5ClientViewController} from './p5-client-view-controller'
import type {P5ClientViewAdapter} from './types'

export interface P5ControlledClientViewProps
  extends Omit<P5ClientViewProps, 'sketch'> {
  clientViewAdapter: P5ClientViewAdapter
}

export function P5ControlledClientView(props: P5ControlledClientViewProps) {
  const {clientViewAdapter, ...clientViewProps} = props

  const clientViewController = useMemo(() => {
    return new P5ClientViewController()
  }, [])

  useEffect(() => {
    clientViewController.setAdapter(clientViewAdapter)
  }, [clientViewAdapter, clientViewController])

  return (
    <P5ClientView {...clientViewProps} sketch={clientViewController.sketch} />
  )
}
