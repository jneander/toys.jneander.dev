import {useMemo} from 'react'

import styles from './styles.module.css'

function scaledBoard(size) {
  const board = []
  for (let row = 0; row < size; row++) {
    board[row] = []
    for (let col = 0; col < size; col++) {
      board[row].push('	')
    }
  }
  return board
}

function populatedBoard(originalBoard, positions) {
  const board = [...originalBoard]
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i]
    board[position.row][position.col] = position.piece
  }
  return board
}

function boardFromProps(props) {
  const board = scaledBoard(props.size)
  return populatedBoard(board, props.positions)
}

function renderRow(row, rowIndex) {
  return (
    <tr key={rowIndex} className={styles.Row}>
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

export default function ChessBoard(props) {
  const {positions, size} = props

  const board = useMemo(
    () => boardFromProps({positions, size}),
    [size, positions]
  )

  return (
    <table className={styles.Board}>
      <tbody>{board.map(renderRow)}</tbody>
    </table>
  )
}
