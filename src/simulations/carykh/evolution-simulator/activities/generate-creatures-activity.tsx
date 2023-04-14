import {useMemo} from 'react'

import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreatureCollectionView, CreatureGridAdapter} from '../creature-collection-view'
import type {AppStore} from '../types'

export interface GenerateCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function GenerateCreaturesActivity(props: GenerateCreaturesActivityProps) {
  const {appController, appStore} = props

  const creatureCollectionAdapter = useMemo(() => {
    function getCreatureAndGridIndexFn(index: number) {
      return {
        creature: appStore.getState().creaturesInLatestGeneration[index],
        gridIndex: index,
      }
    }

    return new CreatureGridAdapter({
      appController,
      appStore,
      getCreatureAndGridIndexFn,
      showsPopupSimulation: () => false,
    })
  }, [appController, appStore])

  function handleBackClick() {
    appStore.setState({generationCount: 0})
    appController.setActivityId(ActivityId.GenerationView)
  }

  return (
    <div className="flow">
      <CreatureCollectionView adapter={creatureCollectionAdapter} />

      <p>Here are your {CREATURE_COUNT} randomly generated creatures!!!</p>

      <button onClick={handleBackClick} type="button">
        Back
      </button>
    </div>
  )
}
