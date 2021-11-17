import {randomInt} from '@jneander/genetics'

import {Position} from './types'

export function listAttacks(position: Position, boardSize: number): Position[] {
  const positions = []
  const movements = [-2, -1, 1, 2]

  for (let row = 0; row < movements.length; row++) {
    for (let col = 0; col < movements.length; col++) {
      const attackPosition = {
        row: position.row + movements[row],
        col: position.col + movements[col]
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

export function positionFromHash(hash: number): Position {
  const col = (hash % 1000) - 1
  const row = (hash - col - 1) / 1000 - 1

  return {row, col}
}

export function randomPosition(boardSize: number) {
  return {row: randomInt(0, boardSize), col: randomInt(0, boardSize)}
}

export function allPositionsForBoard(boardSize: number) {
  const positions = []

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      positions.push({row, col})
    }
  }

  return positions
}
