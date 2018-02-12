import React from 'react'

import KeyCodes from 'js/apps/wai-data-grid/shared/KeyCodes'

import data from './data'
import styles from './styles.css'

function renderRow(datum, rowIndex, grid) {
  const {row, column} = grid.state.focusPointer
  const tabIndexFor = columnIndex => (column === columnIndex && row === rowIndex ? '0' : '-1')
  const refFor = columnIndex => (column === columnIndex && row === rowIndex ? grid.bindFocusedCell : undefined)

  return (
    <tr key={rowIndex}>
      <td className={styles.GridCell} ref={refFor(0)} tabIndex={tabIndexFor(0)}>
        {datum.date}
      </td>
      <td className={styles.GridCell} ref={refFor(1)} tabIndex={tabIndexFor(1)}>
        {datum.type}
      </td>
      <td className={styles.GridCell}>
        <a ref={refFor(2)} tabIndex={tabIndexFor(2)} href="#">
          {datum.description}
        </a>
      </td>
      <td className={styles.GridCell} ref={refFor(3)} tabIndex={tabIndexFor(3)}>
        {datum.amount}
      </td>
      <td className={styles.GridCell} ref={refFor(4)} tabIndex={tabIndexFor(4)}>
        {datum.balance}
      </td>
    </tr>
  )
}

function getCellFromEvent(event, grid) {
  const rows = grid.table.querySelectorAll('tbody tr')
  const row = [].findIndex.call(rows, row => row.contains(event.target))
  if (row > -1) {
    const column = [].findIndex.call(rows[row].children, cell => cell.contains(event.target))
    return {column, row: row - 1}
  }
  return {}
}

export default class WaiDataGrid1 extends React.Component {
  state = {
    focusPointer: {
      column: 0,
      row: 0
    }
  }

  bindFocusedCell = ref => {
    this.activeCell = ref
  }

  bindTableRef = ref => {
    this.table = ref
  }

  focusCell = ({column, row}) => {
    if (row >= 0 && row < data.length) {
      if (column >= 0 && column < 5) {
        this.setState(
          {
            focusPointer: {column, row}
          },
          () => {
            if (this.activeCell) {
              this.activeCell.focus()
            }
          }
        )
      }
    }
  }

  handleClick = event => {
    const cell = getCellFromEvent(event, this)
    this.focusCell(cell)
  }

  handleKeyDown = event => {
    const key = event.which || event.keyCode
    const {column, row} = this.state.focusPointer

    switch (key) {
      case KeyCodes.LEFT:
        this.focusCell({column: column - 1, row})
        break
      case KeyCodes.RIGHT:
        this.focusCell({column: column + 1, row})
        break
      case KeyCodes.UP:
        this.focusCell({column, row: row - 1})
        break
      case KeyCodes.DOWN:
        this.focusCell({column, row: row + 1})
        break
      default:
        return
    }

    event.preventDefault()
  }

  render() {
    return (
      <div>
        <h4 id="grid1Label">Transactions January 1 through January 6</h4>

        <table
          ref={this.bindTableRef}
          role="grid"
          aria-labelledby="grid1Label"
          className={styles.Grid}
          onClick={this.handleClick}
          onKeyDown={this.handleKeyDown}
        >
          <tbody>
            <tr>
              <th className={styles.GridHeader}>Date</th>
              <th className={styles.GridHeader}>Type</th>
              <th className={styles.GridHeader}>Description</th>
              <th className={styles.GridHeader}>Amount</th>
              <th className={styles.GridHeader}>Balance</th>
            </tr>

            {data.map((datum, index) => renderRow(datum, index, this))}
          </tbody>
        </table>
      </div>
    )
  }
}
