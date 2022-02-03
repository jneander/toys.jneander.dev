import {useMemo, useRef} from 'react'

import {P5ClientView} from '../../../../../../shared/p5'
import type {AppController} from '../../../app-controller'
import type {AppStore} from '../../../types'
import {CreatureGridP5UI} from './creature-grid-p5-ui'
import type {CreatureGridViewConfig} from './p5-view'
import {CreateUiFnParameters, createSketchFn} from './sketch'

import styles from './styles.module.css'

export interface CreatureGridProps {
  appController: AppController
  appStore: AppStore
  getCreatureAndGridIndexFn: CreatureGridViewConfig['getCreatureAndGridIndexFn']
  showsPopupSimulation?: boolean
}

export function CreatureGrid(props: CreatureGridProps) {
  const {appController, appStore, getCreatureAndGridIndexFn} = props

  const propsRef = useRef(props)
  propsRef.current = props

  const sketchFn = useMemo(() => {
    function createUiFn({p5Wrapper}: CreateUiFnParameters) {
      return new CreatureGridP5UI({
        appController,
        appStore,
        getCreatureAndGridIndexFn,
        gridStartX: 40,
        gridStartY: 42,
        p5Wrapper,
        showsPopupSimulation: () => !!propsRef.current.showsPopupSimulation
      })
    }

    return createSketchFn({createUiFn})
  }, [appController, appStore, getCreatureAndGridIndexFn])

  return (
    <div className={styles.Container}>
      <P5ClientView sketch={sketchFn} />
    </div>
  )
}
