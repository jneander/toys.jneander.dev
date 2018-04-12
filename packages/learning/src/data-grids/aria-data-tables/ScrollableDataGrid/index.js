import React, {Component} from 'react'

import KeyCodes from '../shared/KeyCodes'
import Row from './Row'
import data from './data'
import styles from './styles.css'

const COLUMNS = [
  {id: 'date'},
  {id: 'type'},
  {id: 'description'},
  {id: 'category'},
  {id: 'amount'},
  {id: 'balance'}
]

function isRowNotVisible(rowIndex, state) {
  return rowIndex < state.visibleRowsStartIndex || rowIndex > state.visibleRowsEndIndex
}

function getLocationFromEvent(event, grid) {
  const rows = grid.table.querySelectorAll('tbody tr')
  const rowIndex = [].findIndex.call(rows, row => row.contains(event.target))
  if (rowIndex > -1) {
    const columnIndex = [].findIndex.call(rows[rowIndex].children, cell =>
      cell.contains(event.target)
    )
    return {
      columnId: grid.props.columns[columnIndex].id,
      rowId: grid.props.rows[rowIndex - 1].id
    }
  }
  return {}
}

export default class ScrollableDataGrid extends Component {
  static defaultProps = {
    columns: COLUMNS,
    perPage: 5,
    rows: data
  }

  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.movePageDown = this.movePageDown.bind(this)
    this.movePageUp = this.movePageUp.bind(this)
    this.toggleTypeAndCategoryColumns = this.toggleTypeAndCategoryColumns.bind(this)

    this.bindActiveElement = ref => {
      this.activeElement = ref
    }

    this.bindTableRef = ref => {
      this.table = ref
    }

    this.state = {
      activeLocation: {
        columnId: this.props.columns[0].id,
        rowId: this.props.rows[0].id
      },
      typeAndCategoryHidden: false,
      visibleRowsEndIndex: this.props.perPage - 1,
      visibleRowsStartIndex: 0
    }
  }

  handleClick(event) {
    const location = getLocationFromEvent(event, this)
    this.setActiveLocation(location)
  }

  handleKeyDown(event) {
    const key = event.which || event.keyCode
    const location = {...this.state.activeLocation}

    const columnIndex = this.props.columns.findIndex(column => column.id === location.columnId)
    const rowIndex = this.props.rows.findIndex(row => row.id === location.rowId)

    switch (key) {
      case KeyCodes.LEFT:
        location.columnId = (this.props.columns[columnIndex - 1] || {}).id
        break
      case KeyCodes.RIGHT:
        location.columnId = (this.props.columns[columnIndex + 1] || {}).id
        break
      case KeyCodes.UP:
        location.rowId = (this.props.rows[rowIndex - 1] || {}).id
        break
      case KeyCodes.DOWN:
        location.rowId = (this.props.rows[rowIndex + 1] || {}).id
        break
      case KeyCodes.PAGEUP:
        event.preventDefault()
        this.movePageUp()
        return
      case KeyCodes.PAGEDOWN:
        event.preventDefault()
        this.movePageDown()
        return
      default:
        return
    }

    event.preventDefault()
    this.setActiveLocation(location)
  }

  movePageDown() {
    // go to next page
    const {perPage, rows} = this.props
    let {visibleRowsEndIndex, visibleRowsStartIndex} = this.state
    const maxEndIndex = rows.length - 1

    if (visibleRowsEndIndex < maxEndIndex) {
      visibleRowsStartIndex = visibleRowsEndIndex + 1
      visibleRowsEndIndex = Math.min(visibleRowsStartIndex + perPage - 1, maxEndIndex)
      const rowId = this.props.rows[visibleRowsStartIndex].id
      this.setActiveLocation(
        {columnId: this.state.activeLocation.columnId, rowId},
        {visibleRowsEndIndex, visibleRowsStartIndex}
      )
    }
  }

  movePageUp() {
    // go to previous page
    const {perPage, rows} = this.props
    let {visibleRowsEndIndex, visibleRowsStartIndex} = this.state
    const maxEndIndex = rows.length - 1

    if (visibleRowsStartIndex > 0) {
      visibleRowsStartIndex = Math.max(visibleRowsStartIndex - perPage, 0)
      visibleRowsEndIndex = Math.min(visibleRowsStartIndex + perPage - 1, maxEndIndex)
      const rowId = this.props.rows[visibleRowsEndIndex].id
      this.setActiveLocation(
        {columnId: this.state.activeLocation.columnId, rowId},
        {visibleRowsEndIndex, visibleRowsStartIndex}
      )
    }
  }

  setActiveLocation(activeLocation, visibleRowIndices = null) {
    console.log(activeLocation, visibleRowIndices)
    const {columns, rows} = this.props
    const {columnId, rowId} = activeLocation

    const columnIndex = this.props.columns.findIndex(column => column.id === columnId)
    const rowIndex = this.props.rows.findIndex(row => row.id === rowId)

    if (
      columnIndex >= 0 &&
      columnIndex < columns.length &&
      rowIndex >= 0 &&
      rowIndex < rows.length
    ) {
      let visibleRowsEndIndex, visibleRowsStartIndex

      if (visibleRowIndices) {
        visibleRowsEndIndex = visibleRowIndices.visibleRowsEndIndex
        visibleRowsStartIndex = visibleRowIndices.visibleRowsStartIndex
      } else {
        visibleRowsEndIndex = this.state.visibleRowsEndIndex
        visibleRowsStartIndex = this.state.visibleRowsStartIndex

        const perPageOffset = this.props.perPage - 1

        if (rowIndex < visibleRowsStartIndex) {
          visibleRowsStartIndex = rowIndex
        } else if (rowIndex > visibleRowsStartIndex + perPageOffset) {
          visibleRowsStartIndex = Math.max(rowIndex - perPageOffset, 0)
        }

        visibleRowsEndIndex = Math.min(
          visibleRowsStartIndex + perPageOffset,
          this.props.rows.length - 1
        )
      }

      this.setState(
        {
          activeLocation,
          visibleRowsEndIndex,
          visibleRowsStartIndex
        },
        () => {
          if (this.activeElement) {
            this.activeElement.focus()
          }
        }
      )
    }
  }

  toggleTypeAndCategoryColumns() {
    const activeLocation = {...this.state.activeLocation}
    if (activeLocation.columnId === 'type') {
      activeLocation.columnId = 'description'
    } else if (activeLocation.columnId === 'category') {
      activeLocation.columnId = 'amount'
    }
    this.setState({
      activeLocation,
      typeAndCategoryHidden: !this.state.typeAndCategoryHidden
    })
  }

  render() {
    const typeAndCategoryClasses = [styles.ColumnHeader]
    if (this.state.typeAndCategoryHidden) {
      typeAndCategoryClasses.push(styles.Hidden)
    }

    return (
      <div className={styles.ExampleContainer}>
        <h4 className={styles.Heading} id="grid3Label">
          Transactions for January 1 through January 15
        </h4>

        <button onClick={this.toggleTypeAndCategoryColumns} type="button">
          {this.state.typeAndCategoryHidden ? 'Show Type and Category' : 'Hide Type and Category'}
        </button>

        <table
          aria-colcount={this.props.columns.length}
          aria-labelledby="grid3Label"
          aria-rowcount={this.props.rows.length}
          className={styles.Grid}
          onClick={this.handleClick}
          onKeyDown={this.handleKeyDown}
          ref={this.bindTableRef}
          role="grid"
        >
          <tbody>
            <tr data-fixed="true">
              <th className={styles.ColumnHeader}>Date</th>
              <th className={typeAndCategoryClasses.join(' ')}>Type</th>
              <th className={styles.ColumnHeader}>Description</th>
              <th className={typeAndCategoryClasses.join(' ')}>Category</th>
              <th className={styles.ColumnHeader}>Amount</th>
              <th className={styles.ColumnHeader}>Balance</th>
            </tr>

            {this.props.rows.map((row, rowIndex) => {
              const classNames = []
              if (isRowNotVisible(rowIndex, this.state)) {
                classNames.push(styles.Hidden)
              }

              return (
                <Row
                  activeLocation={this.state.activeLocation}
                  bindActiveElement={this.bindActiveElement}
                  className={classNames.join(' ')}
                  key={rowIndex}
                  row={row}
                  rowIndex={rowIndex}
                  typeAndCategoryHidden={this.state.typeAndCategoryHidden}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
