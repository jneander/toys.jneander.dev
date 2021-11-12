import {useMemo} from 'react'

import ChessBoard from '../shared/ChessBoard'

export default function Board(props) {
  const {chromosome, size} = props

  const positions = useMemo(() => {
    const board = []

    for (let row = 0; row < size; row++) {
      board[row] = []
      for (let col = 0; col < size; col++) {
        board[row].push('	')
      }
    }

    const positions = []

    if (chromosome) {
      const {genes} = chromosome

      for (let i = 0; i < chromosome.genes.length; i += 2) {
        positions.push({row: genes[i], col: genes[i + 1], piece: '&#9819;'})
      }
    }

    return positions
  }, [chromosome, size])

  return <ChessBoard positions={positions} size={size} />
}
