import {Chromosome} from '@jneander/genetics'
import {useMemo} from 'react'

import {ChessBoard, KNIGHT_UNICODE} from '../shared'
import {Position} from './types'

interface BoardProps {
  chromosome?: Chromosome<Position>
  size: number
}

export default function Board(props: BoardProps) {
  const {chromosome, size} = props

  const positions = useMemo(() => {
    const board: string[][] = []

    for (let row = 0; row < size; row++) {
      board[row] = []
      for (let col = 0; col < size; col++) {
        board[row].push('	')
      }
    }

    const positions = []

    if (chromosome) {
      const {genes} = chromosome

      for (let i = 0; i < chromosome.genes.length; i++) {
        positions.push({
          row: genes[i].row,
          col: genes[i].col,
          piece: KNIGHT_UNICODE
        })
      }
    }

    return positions
  }, [chromosome, size])

  return <ChessBoard positions={positions} size={size} />
}