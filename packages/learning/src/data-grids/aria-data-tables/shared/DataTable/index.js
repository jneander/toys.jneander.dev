import React, {Component} from 'react'

import KeyCodes from '../KeyCodes'
import HeaderRow from './HeaderRow'
import Row from './Row'
import styles from './styles.css'

function isRowNotVisible(rowIndex, state) {
  return rowIndex < state.visibleRowsStartIndex || rowIndex > state.visibleRowsEndIndex
}

function getLocationFromEvent(event, grid) {
  const rows = grid.table.querySelectorAll('tbody tr')
  const rowIndex = [].findIndex.call(rows, row => row.contains(event.target))
  if (rowIndex > 0) {
    // TODO: optionally include header row
    const columnIndex = [].findIndex.call(rows[rowIndex].children, cell =>
      cell.contains(event.target)
    )
    if (columnIndex > -1) {
      return {
        columnId: grid.props.columns[columnIndex].id,
        region: 'body',
        rowId: grid.props.rows[rowIndex - 1].id
      }
    }
  }
  return {}
}

export default class DataTable extends Component {
  static defaultProps = {
    navigableHeaders: false,
    perPage: 5
  }

  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.movePageDown = this.movePageDown.bind(this)
    this.movePageUp = this.movePageUp.bind(this)

    this.bindActiveElement = ref => {
      this.activeElement = ref
    }

    this.bindTableRef = ref => {
      this.table = ref
    }

    this.state = {
      activeLocation: {
        columnId: this.props.columns[0].id,
        region: this.props.navigableHeaders ? 'header' : 'body',
        rowId: this.props.navigableHeaders ? null : this.props.rows[0].id
      },
      visibleRowsEndIndex: this.props.perPage - 1,
      visibleRowsStartIndex: 0
    }
  }

  componentWillReceiveProps(nextProps) {
    let {activeLocation} = this.state
    const {columnId} = activeLocation
    const matchActiveColumn = column => column.id === columnId

    if (!nextProps.columns.some(matchActiveColumn)) {
      const indexOfActiveColumn = this.props.columns.findIndex(matchActiveColumn)
      const columnsAfterActiveColumn = this.props.columns.slice(indexOfActiveColumn + 1)
      const nextColumnAlsoInNextProps = columnsAfterActiveColumn.find(column =>
        nextProps.columns.some(nextPropsColumn => nextPropsColumn.id === column.id)
      )
      // TODO: look backwards if forwards does not match the column
      activeLocation = {...activeLocation, columnId: nextColumnAlsoInNextProps.id}
    }

    this.setState({activeLocation})
    // TODO: adjust focus if focus lived in a cell no longer present
  }

  handleClick(event) {
    const location = getLocationFromEvent(event, this)
    this.setActiveLocation(location)
  }

  handleKeyDown(event) {
    const key = event.which || event.keyCode
    let location = this.state.activeLocation

    const columnIndex = this.props.columns.findIndex(column => column.id === location.columnId)
    const rowIndex = this.props.rows.findIndex(row => row.id === location.rowId)

    switch (key) {
      case KeyCodes.LEFT:
        location = {
          ...location,
          columnId: (this.props.columns[columnIndex - 1] || {}).id
        }
        break
      case KeyCodes.RIGHT:
        location = {
          ...location,
          columnId: (this.props.columns[columnIndex + 1] || {}).id
        }
        break
      case KeyCodes.UP:
        if (rowIndex === 0 && this.props.navigableHeaders) {
          location = {...location, region: 'header', rowId: null}
        } else {
          location = {...location, rowId: (this.props.rows[rowIndex - 1] || {}).id}
        }
        break
      case KeyCodes.DOWN:
        location = {...location, region: 'body', rowId: (this.props.rows[rowIndex + 1] || {}).id}
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

    if (location !== this.state.activeLocation) {
      event.preventDefault()
      this.setActiveLocation(location)
    }
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
        {...this.state.activeLocation, rowId},
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
        {...this.state.activeLocation, rowId},
        {visibleRowsEndIndex, visibleRowsStartIndex}
      )
    }
  }

  setActiveLocation(activeLocation, visibleRowIndices = null) {
    const {columns, navigableHeaders, rows} = this.props
    const {columnId, region, rowId} = {...this.props.activeLocation, ...activeLocation}

    if (region === 'header' && !navigableHeaders) {
      return
    }

    const columnIndex = this.props.columns.findIndex(column => column.id === columnId)

    if (columnIndex < 0 || columnIndex >= columns.length) {
      return
    }

    const rowIndex = region === 'header' ? 0 : this.props.rows.findIndex(row => row.id === rowId)

    if (region !== 'header' && (rowIndex < 0 || rowIndex >= rows.length)) {
      return
    }

    let visibleRowsEndIndex, visibleRowsStartIndex

    if (visibleRowIndices) {
      visibleRowsEndIndex = visibleRowIndices.visibleRowsEndIndex
      visibleRowsStartIndex = visibleRowIndices.visibleRowsStartIndex
    } else if (region === 'header') {
      visibleRowsStartIndex = 0
      visibleRowsEndIndex = this.props.perPage - 1
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

  render() {
    return (
      <table
        aria-colcount={this.props.columns.length}
        aria-labelledby={this.props['aria-labelledby']}
        aria-rowcount={this.props.rows.length}
        className={styles.Table}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        ref={this.bindTableRef}
        role="grid"
      >
        <tbody>
          <HeaderRow
            activeLocation={this.state.activeLocation}
            bindActiveElement={this.bindActiveElement}
            columns={this.props.columns}
          />

          {this.props.rows.map((row, rowIndex) => (
            <Row
              activeLocation={this.state.activeLocation}
              bindActiveElement={this.bindActiveElement}
              columns={this.props.columns}
              hidden={isRowNotVisible(rowIndex, this.state)}
              key={rowIndex}
              row={row}
            />
          ))}
        </tbody>
      </table>
    )
  }
}
