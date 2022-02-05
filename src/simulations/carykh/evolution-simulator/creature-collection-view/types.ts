import type {Creature} from '../creatures'

export type CreatureAndGridIndex = {
  creature: Creature
  gridIndex: number
}

export type RowAndColumn = {
  columnIndex: number
  rowIndex: number
}
