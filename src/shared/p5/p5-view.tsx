import p5 from 'p5'
import {HTMLAttributes, useEffect, useRef} from 'react'

import type {P5Sketch} from './types'

export interface P5ViewProps extends HTMLAttributes<HTMLDivElement> {
  sketch: P5Sketch
}

export function P5View(props: P5ViewProps) {
  const {sketch, ...divProps} = props

  const containerRef = useRef(null)

  useEffect(() => {
    const instance = new p5(sketch, containerRef.current!)

    return () => {
      instance.remove()
    }
  }, [sketch])

  return <div ref={containerRef} {...divProps}></div>
}
