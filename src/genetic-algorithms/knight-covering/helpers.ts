import {MathRandomNumberGenerator} from '@jneander/utils-random'

import type {ChessBoardPosition} from '../shared'
import {KNIGHT_CHARACTER} from './constants'
import type {KnightCoveringGene} from './types'

const rng = new MathRandomNumberGenerator()

export function listAttacks(position: ChessBoardPosition, boardSize: number): ChessBoardPosition[] {
  const positions: ChessBoardPosition[] = []
  const movements = [-2, -1, 1, 2]

  for (let row = 0; row < movements.length; row++) {
    for (let col = 0; col < movements.length; col++) {
      const attackPosition: ChessBoardPosition = {
        row: position.row + movements[row],
        col: position.col + movements[col],
        piece: KNIGHT_CHARACTER,
      }

      if (
        attackPosition.row >= 0 &&
        attackPosition.row < boardSize &&
        attackPosition.col >= 0 &&
        attackPosition.col < boardSize &&
        Math.abs(movements[row]) !== Math.abs(movements[col])
      ) {
        positions.push(attackPosition)
      }
    }
  }

  return positions
}

export function positionHash(row: number, col: number): number {
  return (row + 1) * 1000 + col + 1
}

export function positionFromHash(hash: number, piece = ' '): ChessBoardPosition {
  const col = (hash % 1000) - 1
  const row = (hash - col - 1) / 1000 - 1

  return {row, col, piece}
}

export function randomPosition(boardSize: number): KnightCoveringGene {
  return {
    row: rng.nextInt32(0, boardSize),
    col: rng.nextInt32(0, boardSize),
    piece: KNIGHT_CHARACTER,
  }
}
