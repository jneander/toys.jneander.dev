export function listAttacks(position, boardSize) {
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

export function positionHash(row, col) {
  return (row + 1) * 1000 + col + 1
}

export function positionFromHash(hash) {
  const col = (hash % 1000) - 1
  const row = (hash - col - 1) / 1000 - 1
  return {row, col}
}
