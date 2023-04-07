import {useEffect, useMemo} from 'react'

import {P5View, P5ViewProps} from '../../../../shared/p5'
import {P5ClientViewController} from './p5-client-view-controller'
import type {P5ClientViewAdapter} from './types'

export interface P5ControlledClientViewProps extends Omit<P5ViewProps, 'sketch'> {
  clientViewAdapter: P5ClientViewAdapter
  height?: number
  scale?: number
  width?: number
}

export function P5ControlledClientView(props: P5ControlledClientViewProps) {
  const {clientViewAdapter, height, scale, width, ...clientViewProps} = props

  const clientViewController = useMemo(() => {
    return new P5ClientViewController({height, scale, width})
  }, [height, scale, width])

  useEffect(() => {
    clientViewController.setAdapter(clientViewAdapter)
  }, [clientViewAdapter, clientViewController])

  return <P5View {...clientViewProps} sketch={clientViewController.sketch} />
}
