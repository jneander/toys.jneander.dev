import {Store} from '@jneander/utils-state'
import {useMemo} from 'react'

import {
  Creature,
  getSpeciesColorHslString,
  speciesIdForCreature
} from '../../../creatures'
import {P5ControlledClientView} from '../../../p5-utils'
import type {SimulationConfig} from '../../../simulation'
import {CreatureInfoAdapter} from './creature-info-adapter'
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

  const clientViewAdapter = useMemo(() => {
    return new CreatureInfoAdapter({
      creature,
      simulationConfig,
      creatureInfoStore: store
    })
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
        <P5ControlledClientView
          clientViewAdapter={clientViewAdapter}
          height={240}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          scale={1}
          width={240}
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
