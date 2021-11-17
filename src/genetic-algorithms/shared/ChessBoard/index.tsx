import {useMemo} from 'react'

import styles from './styles.module.css'

type BoardRow = string[]
type BoardTable = BoardRow[]

type ChessBoardPosition = {
  col: number
  row: number
  piece: string
}

function scaledBoard(size: number) {
  const board: BoardTable = []

  for (let row = 0; row < size; row++) {
    board[row] = []
    for (let col = 0; col < size; col++) {
      board[row].push('	')
    }
  }

  return board
}

function populatedBoard(
  originalBoard: BoardTable,
  positions: ChessBoardPosition[]
) {
  const board = [...originalBoard]

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i]
    board[position.row][position.col] = position.piece
  }

  return board
}

interface ChessBoardProps {
  positions: ChessBoardPosition[]
  size: number
}

function boardFromProps(props: ChessBoardProps) {
  const board = scaledBoard(props.size)
  return populatedBoard(board, props.positions)
}

interface RowProps {
  row: BoardRow
}

function Row({row}: RowProps) {
  return (
    <tr className={styles.Row}>
      {row.map((piece, index) => (
        <td
          key={index}
          className={styles.Space}
          dangerouslySetInnerHTML={{__html: piece}}
        />
      ))}
    </tr>
  )
}

interface ChessBoardProps {
  positions: ChessBoardPosition[]
  size: number
}

export default function ChessBoard(props: ChessBoardProps) {
  const {positions, size} = props

  const board = useMemo(
    () => boardFromProps({positions, size}),
    [size, positions]
  )

  return (
    <table className={styles.Board}>
      <tbody>
        {board.map((row, index) => (
          <Row key={index} row={row} />
        ))}
      </tbody>
    </table>
  )
}
