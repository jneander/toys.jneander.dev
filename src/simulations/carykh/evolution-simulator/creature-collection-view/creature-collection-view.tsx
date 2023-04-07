import {P5ClientViewAdapter, P5ControlledClientView} from '../p5-utils'
import {CREATURE_COLLECTION_VIEW_HEIGHT, CREATURE_COLLECTION_VIEW_WIDTH} from './constants'

import styles from './styles.module.css'

export interface CreatureCollectionViewProps {
  adapter: P5ClientViewAdapter
}

export function CreatureCollectionView(props: CreatureCollectionViewProps) {
  const {adapter} = props

  return (
    <div className={styles.Container}>
      <P5ControlledClientView
        clientViewAdapter={adapter}
        height={CREATURE_COLLECTION_VIEW_HEIGHT}
        scale={1}
        width={CREATURE_COLLECTION_VIEW_WIDTH}
      />
    </div>
  )
}
