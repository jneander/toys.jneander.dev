import React, {Component} from 'react'

import KeyCodes from '../shared/KeyCodes'
import ColumnHeader from './ColumnHeader'
import DropDownCell from './DropDownCell'
import TextCell from './TextCell'
import TextInputCell from './TextInputCell'
import data from './data'
import styles from './css/styles.css'

function TableRow(props) {
  const {datum, rowIndex} = props
  const {row, column} = props.focusPointer
  const tabIndexFor = columnIndex => (column === columnIndex && row === rowIndex ? '0' : '-1')
  const refFor = columnIndex =>
    column === columnIndex && row === rowIndex ? props.activeCellRef : undefined
  const cellIsActive = columnIndex => column === columnIndex && row === rowIndex

  return (
    <tr>
      <TextCell ref={refFor(0)} isActive={cellIsActive(0)} content={datum.date} />
      <TextCell ref={refFor(1)} isActive={cellIsActive(1)} content={datum.type} />
      <TextInputCell ref={refFor(2)} isActive={cellIsActive(2)} content={datum.description} />
      <DropDownCell
        ref={refFor(3)}
        isActive={cellIsActive(3)}
        content={datum.category}
        rowIndex={rowIndex}
      />
      <TextCell ref={refFor(4)} isActive={cellIsActive(4)} content={datum.amount} />
      <TextCell ref={refFor(5)} isActive={cellIsActive(5)} content={datum.balance} />
    </tr>
  )
}

function getCellFromEvent(event, grid) {
  const rows = grid.table.querySelectorAll('tbody tr')
  const row = [].findIndex.call(rows, row => row.contains(event.target))
  if (row > -1) {
    const column = [].findIndex.call(rows[row].children, cell => cell.contains(event.target))
    return {column, row}
  }
  return {}
}

export default class SortableDataGrid extends Component {
  state = {
    data: [...data],
    focusPointer: {
      column: 0,
      row: 0
    },
    rowWithOpenCategoryMenu: null,
    sortColumn: 'date',
    sortDirection: 'ascending'
  }

  bindFocusedCell = ref => {
    this.activeCell = ref
  }

  bindTableRef = ref => {
    this.table = ref
  }

  focusCell = ({column, row}) => {
    if (row >= 0 && row <= this.state.data.length) {
      if (column >= 0 && column < 6) {
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

  handleBlur = event => {
    this.setState({
      hasFocus: false
    })
  }

  handleClick = event => {
    const cell = getCellFromEvent(event, this)
    this.focusCell(cell)
  }

  handleFocus = event => {
    this.setState({
      hasFocus: true
    })
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
      default:
        return
    }

    event.preventDefault()
  }

  handleSortByAmount = direction => {
    this.sortData('amount', direction)
  }

  handleSortByDate = direction => {
    this.sortData('date', direction)
  }

  sortData = (sortColumn, sortDirection) => {
    const data = [...this.state.data].sort((a, b) => {
      let valueA = a[sortColumn]
      let valueB = b[sortColumn]
      if (sortDirection === 'descending') {
        ;[valueA, valueB] = [valueB, valueA]
      }
      if (valueA === valueB) {
        return 0
      }
      return valueA > valueB ? 1 : -1
    })
    this.setState({data, sortColumn, sortDirection})
  }

  render() {
    const {row, column} = this.state.focusPointer
    const refForHeader = columnIndex =>
      column === columnIndex && row === 0 ? this.bindFocusedCell : undefined
    const sortDirectionForColumn = columnKey =>
      this.state.sortColumn === columnKey ? this.state.sortDirection : 'none'

    return (
      <div>
        <h4 id="grid2Label">Transactions January 1 through January 7</h4>

        <table
          ref={this.bindTableRef}
          role="grid"
          aria-labelledby="grid2Label"
          className={`${styles.Grid} data`}
          onBlur={this.handleBlur}
          onClick={this.handleClick}
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyDown}
        >
          <tbody>
            <tr>
              <ColumnHeader
                ref={refForHeader(0)}
                isActive={row === 0 && column === 0}
                onSort={this.handleSortByDate}
                sortable
                sortDirection={sortDirectionForColumn('date')}
              >
                Date
              </ColumnHeader>

              <ColumnHeader ref={refForHeader(1)} isActive={row === 0 && column === 1}>
                Type
              </ColumnHeader>

              <ColumnHeader ref={refForHeader(2)} isActive={row === 0 && column === 2}>
                Description
              </ColumnHeader>

              <ColumnHeader ref={refForHeader(3)} isActive={row === 0 && column === 3}>
                Category
              </ColumnHeader>

              <ColumnHeader
                ref={refForHeader(4)}
                isActive={row === 0 && column === 4}
                onSort={this.handleSortByAmount}
                sortable
                sortDirection={sortDirectionForColumn('amount')}
              >
                Amount
              </ColumnHeader>

              <ColumnHeader ref={refForHeader(5)} isActive={row === 0 && column === 5}>
                Balance
              </ColumnHeader>
            </tr>

            {this.state.data.map((datum, index) => (
              <TableRow
                datum={datum}
                focusPointer={this.state.focusPointer}
                key={datum.id}
                rowIndex={index + 1}
                activeCellRef={this.bindFocusedCell}
              />
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}
