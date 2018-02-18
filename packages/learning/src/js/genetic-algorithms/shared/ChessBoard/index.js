import React, {PureComponent} from 'react'

import styles from './styles.css'

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
        <td key={index} className={styles.Space}>
          {piece}
        </td>
      ))}
    </tr>
  )
}

export default class Board extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      board: boardFromProps(props)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.size !== this.props.size || nextProps.positions !== this.props.positions) {
      this.setState({
        board: boardFromProps(nextProps)
      })
    }
  }

  render() {
    return (
      <table className={styles.Board}>
        <tbody>{this.state.board.map(renderRow)}</tbody>
      </table>
    )
  }
}
