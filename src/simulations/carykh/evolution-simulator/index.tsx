import {AleaNumberGenerator} from '@jneander/utils-random'
import {ReactNode, useEffect, useState} from 'react'

import {NullActivity} from './activities'
import {AppController} from './app-controller'
import {ActivityId} from './constants'
import {SimulationConfig} from './simulation'
import {createSketchFn} from './sketch'
import type {AppState} from './types'

export function CarykhEvolutionSimulator() {
  const [content, setContent] = useState<ReactNode>(null)

  useEffect(() => {
    let mounted = true

    import('../../../shared/p5').then(module => {
      if (mounted) {
        const SEED = 0
        const randomNumberGenerator = new AleaNumberGenerator({seed: SEED})

        const appState: AppState = {
          creaturesInLatestGeneration: [],
          currentActivity: new NullActivity(),
          currentActivityId: null,
          generationCount: -1,
          generationHistoryMap: {},
          nextActivityId: ActivityId.Start,
          selectedGeneration: 0
        }

        const simulationConfig: SimulationConfig = {
          hazelStairs: -1
        }

        const appController = new AppController({
          appState,
          randomNumberGenerator,
          simulationConfig
        })

        const sketchFn = createSketchFn({
          appController,
          appState
        })

        const {P5View} = module
        setContent(<P5View sketch={sketchFn}></P5View>)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  return <div>{content}</div>
}
