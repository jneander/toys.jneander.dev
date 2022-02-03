import {useEffect, useMemo, useRef} from 'react'

import type {AppController} from '../../../app-controller'
import type {AppStore} from '../../../types'
import type {CreatureGridViewConfig} from './p5-view'
import {ViewController} from './view-controller'

import styles from './styles.module.css'

export interface CreatureGridProps {
  appController: AppController
  appStore: AppStore
  getCreatureAndGridIndexFn: CreatureGridViewConfig['getCreatureAndGridIndexFn']
}

export function CreatureGrid(props: CreatureGridProps) {
  const {appController, appStore, getCreatureAndGridIndexFn} = props

  const containerRef = useRef(null)

  const viewController = useMemo(() => {
    return new ViewController({
      appController,
      appStore,
      getCreatureAndGridIndexFn
    })
  }, [appController, appStore, getCreatureAndGridIndexFn])

  useEffect(() => {
    viewController.initialize(containerRef.current!)

    return () => {
      viewController.deinitialize()
    }
  }, [viewController])

  return <div className={styles.Container} ref={containerRef} />
}
