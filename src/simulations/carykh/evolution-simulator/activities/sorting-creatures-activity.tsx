import {useEffect, useMemo} from 'react'

import {P5ClientView} from '../../../../shared/p5'
import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT, SCALE_TO_FIX_BUG} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import {creatureIdToIndex} from '../helpers'
import {CreateActivityFnParameters, createSketchFn} from '../sketch'
import type {AppStore} from '../types'
import {
  CREATURE_GRID_TILES_PER_ROW,
  CREATURE_GRID_TILE_HEIGHT,
  CREATURE_GRID_TILE_WIDTH
} from '../views'
import {P5Activity, P5ActivityConfig} from './shared'

export interface SortingCreaturesActivityProps {
  appController: AppController
  appStore: AppStore
}

export function SortingCreaturesActivity(props: SortingCreaturesActivityProps) {
  const {appController, appStore} = props

  useEffect(() => {
    appController.sortCreatures()
    appController.updateHistory()
  }, [appController])

  const sketchFn = useMemo(() => {
    function createActivityFn({p5Wrapper}: CreateActivityFnParameters) {
      return new SortingCreaturesP5Activity({
        appController,
        appStore,
        p5Wrapper
      })
    }

    return createSketchFn({createActivityFn})
  }, [appController, appStore])

  function handleSkipClick() {
    appController.setActivityId(ActivityId.SortedCreatures)
  }

  return (
    <div>
      <div style={{height: '576px'}}>
        <P5ClientView sketch={sketchFn} />
      </div>

      <button onClick={handleSkipClick} type="button">
        Skip
      </button>
    </div>
  )
}

class SortingCreaturesP5Activity extends P5Activity {
  private creatureDrawer: CreatureDrawer

  private activityTimer: number

  constructor(config: P5ActivityConfig) {
    super(config)

    this.creatureDrawer = new CreatureDrawer({p5Wrapper: this.p5Wrapper})

    this.activityTimer = 0
  }

  draw(): void {
    const {appStore, p5Wrapper} = this
    const {canvas} = p5Wrapper

    const scale = 10

    canvas.background(220, 253, 102)
    canvas.push()
    canvas.scale(scale / SCALE_TO_FIX_BUG)

    const creatureScale = 0.1

    const transition =
      0.5 - 0.5 * Math.cos(Math.min(this.activityTimer / 60, Math.PI))

    const gridStartX = 40 * creatureScale
    const gridStartY = 42 * creatureScale

    const scaledCreatureWidth = CREATURE_GRID_TILE_WIDTH * creatureScale
    const scaledCreatureHeight = CREATURE_GRID_TILE_HEIGHT * creatureScale

    for (let i2 = 0; i2 < CREATURE_COUNT; i2++) {
      // i2 is the index of where the creature is now
      const creature = appStore.getState().creaturesInLatestGeneration[i2]

      // i1 is the index of where the creature was
      const i1 = creatureIdToIndex(creature.id)

      const x1 = i1 % CREATURE_GRID_TILES_PER_ROW
      const y1 = Math.floor(i1 / CREATURE_GRID_TILES_PER_ROW)
      const x2 = i2 % CREATURE_GRID_TILES_PER_ROW
      const y2 = Math.floor(i2 / CREATURE_GRID_TILES_PER_ROW)
      const x3 = this.interpolate(x1, x2, transition)
      const y3 = this.interpolate(y1, y2, transition)

      const creatureCenterX = x3 * scaledCreatureWidth + scaledCreatureWidth / 2
      const creatureBottomY = y3 * scaledCreatureHeight + scaledCreatureHeight

      this.creatureDrawer.drawCreature(
        creature,
        creatureCenterX + gridStartX,
        creatureBottomY + gridStartY,
        canvas
      )
    }

    canvas.pop()

    this.activityTimer += 10

    if (this.activityTimer > 60 * Math.PI) {
      this.appController.setActivityId(ActivityId.SortedCreatures)
    }
  }

  private interpolate(a: number, b: number, offset: number): number {
    return a + (b - a) * offset
  }
}
