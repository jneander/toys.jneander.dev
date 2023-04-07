import {useMemo} from 'react'

import {buildPopulatedBoard} from './helpers'
import {ChessBoardPosition} from './types'

import styles from './styles.module.css'

interface ChessBoardRowProps {
  row: string[]
}

function ChessBoardRow({row}: ChessBoardRowProps) {
  return (
    <tr className={styles.Row}>
      {row.map((piece, index) => (
        <td key={index} className={styles.Space} dangerouslySetInnerHTML={{__html: piece}} />
      ))}
    </tr>
  )
}

interface ChessBoardProps {
  positions?: ChessBoardPosition[]
  size: number
}

export function ChessBoard(props: ChessBoardProps) {
  const {positions, size} = props

  const board = useMemo(() => buildPopulatedBoard(size, positions), [size, positions])

  return (
    <table className={styles.Board}>
      <tbody>
        {board.map((row, index) => (
          <ChessBoardRow key={index} row={row} />
        ))}
      </tbody>
    </table>
  )
}
