import {ChessBoardPosition, ChessBoardTable} from './types'

function buildScaledBoard(size: number): ChessBoardTable {
  const board: string[][] = []

  for (let row = 0; row < size; row++) {
    board[row] = []
    for (let col = 0; col < size; col++) {
      board[row].push('	')
    }
  }

  return board
}

function populateBoard(
  originalBoard: ChessBoardTable,
  positions: ChessBoardPosition[]
): ChessBoardTable {
  const board = [...originalBoard]

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i]
    board[position.row][position.col] = position.piece
  }

  return board
}

export function buildPopulatedBoard(
  size: number,
  positions: ChessBoardPosition[]
) {
  const board = buildScaledBoard(size)
  return populateBoard(board, positions)
}