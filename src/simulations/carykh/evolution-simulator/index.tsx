import {ReactNode, useEffect, useState} from 'react'

import sketch from './sketch'

export function CarykhEvolutionSimulator() {
  const [content, setContent] = useState<ReactNode>(null)

  useEffect(() => {
    let mounted = true

    import('../../../shared/p5').then(module => {
      if (mounted) {
        const {P5View} = module
        setContent(<P5View sketch={sketch}></P5View>)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  return <div>{content}</div>
}
