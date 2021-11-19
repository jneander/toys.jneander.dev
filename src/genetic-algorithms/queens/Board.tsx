import {useMemo} from 'react'

import {ChessBoard, ChessBoardTable, QUEEN_UNICODE} from '../shared'
import {QueensChromosome} from './types'

interface BoardProps {
  chromosome?: QueensChromosome
  size: number
}

export default function Board(props: BoardProps) {
  const {chromosome, size} = props

  const positions = useMemo(() => {
    const board: ChessBoardTable = []

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
        positions.push({row: genes[i], col: genes[i + 1], piece: QUEEN_UNICODE})
      }
    }

    return positions
  }, [chromosome, size])

  return <ChessBoard positions={positions} size={size} />
}
