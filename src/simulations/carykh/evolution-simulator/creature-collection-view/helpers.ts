import type p5 from 'p5'
import type {Color} from 'p5'

import {getSpeciesColorHSB} from '../creatures'
import {CREATURE_GRID_TILES_PER_ROW} from './constants'
import type {RowAndColumn} from './types'

export function gridIndexToRowAndColumn(gridIndex: number): RowAndColumn {
  const columnIndex = gridIndex % CREATURE_GRID_TILES_PER_ROW
  const rowIndex = Math.floor(gridIndex / CREATURE_GRID_TILES_PER_ROW)

  return {columnIndex, rowIndex}
}

export function getSpeciesColor(
  p5: p5,
  speciesId: number,
  adjust: boolean
): Color {
  const [h, s, b] = getSpeciesColorHSB(speciesId, adjust)

  p5.colorMode(p5.HSB, 1.0)
  return p5.color(h, s, b)
}
