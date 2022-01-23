import dynamic from 'next/dynamic'

import type {P5ViewProps as P5ClientViewProps} from './p5-view'

export type {P5ClientViewProps}

const P5View = dynamic<P5ClientViewProps>(
  () => import('./p5-view').then(module => module.P5View),
  {ssr: false}
)

export function P5ClientView(props: P5ClientViewProps) {
  return <P5View {...props} />
}
