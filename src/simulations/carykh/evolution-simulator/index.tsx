import {AleaNumberGenerator} from '@jneander/utils-random'
import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {P5ClientView} from '../../../shared/p5'
import {AppController} from './app-controller'
import {ActivityId} from './constants'
import {SimulationConfig} from './simulation'
import {createSketchFn} from './sketch'
import type {AppState} from './types'

export function CarykhEvolutionSimulator() {
  const sketchFn = useMemo(() => {
    const SEED = 0
    const randomNumberGenerator = new AleaNumberGenerator({seed: SEED})

    const appStore = new Store<AppState>({
      creaturesInLatestGeneration: [],
      currentActivityId: null,
      generationCount: -1,
      generationHistoryMap: {},
      nextActivityId: ActivityId.Start,
      selectedGeneration: 0
    })

    const simulationConfig: SimulationConfig = {
      hazelStairs: -1
    }

    const appController = new AppController({
      appStore,
      randomNumberGenerator,
      simulationConfig
    })

    return createSketchFn({
      appController,
      appStore
    })
  }, [])

  return <P5ClientView sketch={sketchFn} />
}
