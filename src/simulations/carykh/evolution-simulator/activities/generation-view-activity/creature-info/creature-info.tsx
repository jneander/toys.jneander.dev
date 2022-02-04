import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {P5ClientView} from '../../../../../../shared/p5'
import {
  Creature,
  getSpeciesColorHslString,
  speciesIdForCreature
} from '../../../creatures'
import type {SimulationConfig} from '../../../simulation'
import {CreatureInfoP5Ui} from './creature-info-p5-ui'
import {CreateUiFnParameters, createSketchFn} from './sketch'
import type {CreatureInfoState} from './types'

import styles from './styles.module.css'

export interface CreatureInfoProps {
  creature: Creature
  rankText: string
  simulationConfig: SimulationConfig
}

export function CreatureInfo(props: CreatureInfoProps) {
  const {creature, rankText, simulationConfig} = props

  const store = useMemo(() => {
    return new Store<CreatureInfoState>({
      showSimulation: false
    })
  }, [])

  const sketchFn = useMemo(() => {
    function createUiFn({p5Wrapper}: CreateUiFnParameters) {
      return new CreatureInfoP5Ui({
        creature,
        p5Wrapper,
        simulationConfig,
        store
      })
    }

    return createSketchFn({createUiFn})
  }, [creature, simulationConfig, store])

  function handleMouseEnter() {
    store.setState({showSimulation: true})
  }

  function handleMouseLeave() {
    store.setState({showSimulation: false})
  }

  const speciesId = speciesIdForCreature(creature)
  const color = getSpeciesColorHslString(speciesId, false)

  return (
    <div className={styles.Container}>
      <div className={styles.CanvasContainer}>
        <P5ClientView
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sketch={sketchFn}
        />
      </div>

      <dl className={styles.Details}>
        <dt>Rank</dt>
        <dl>{rankText}</dl>

        <dt>ID</dt>
        <dl>{creature.id}</dl>

        <dt>Fitness</dt>
        <dl className={styles.FitnessValue}>{creature.fitness.toFixed(3)}</dl>

        <dt>Species</dt>
        <dl style={{color}}>{speciesIdForCreature(creature)}</dl>
      </dl>
    </div>
  )
}
