import {AleaNumberGenerator} from '@jneander/utils-random'
import {useMemo} from 'react'

import {P5ClientView} from '../../../shared/p5'
import {NullActivity} from './activities'
import {AppController} from './app-controller'
import {ActivityId} from './constants'
import {SimulationConfig} from './simulation'
import {createSketchFn} from './sketch'
import type {AppState} from './types'

export function CarykhEvolutionSimulator() {
  const sketchFn = useMemo(() => {
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

    return createSketchFn({
      appController,
      appState
    })
  }, [])

  return <P5ClientView sketch={sketchFn} />
}
