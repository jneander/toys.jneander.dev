import React, {Component} from 'react'
import Pagination, {PaginationButton} from '@instructure/ui-pagination/lib/components/Pagination'

import KeyCodes from './KeyCodes'
import HeaderRow from './HeaderRow'
import BodyRow from './BodyRow'
import styles from './styles.css'

function getVisibleRows(rows, state) {
  const visibleRows = []
  for (let i = state.visibleRowsStartIndex; i <= state.visibleRowsEndIndex; i++) {
    visibleRows.push(rows[i])
  }
  return visibleRows
}

function getLocationFromEvent(event, self) {
  const rows = self.rowGroup.children
  let rowIndex = [].findIndex.call(rows, row => row.contains(event.target))
  if (rowIndex !== -1) {
    let columnIndex = [].findIndex.call(rows[rowIndex].children, cell =>
      cell.contains(event.target)
    )
    rowIndex += self.state.visibleRowsStartIndex
    if (columnIndex !== -1) {
      return {
        columnId: self.props.columns[columnIndex].id,
        region: 'body',
        rowId: self.props.rows[rowIndex].id
      }
    }
  }
  return {}
}

export default class DataGrid extends Component {
  static defaultProps = {
    navigableHeaders: false,
    rowsPerPage: 5
  }

  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.handleHeaderClick = this.handleHeaderClick.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.movePageDown = this.movePageDown.bind(this)
    this.movePageUp = this.movePageUp.bind(this)
    this.setPage = this.setPage.bind(this)

    this.bindActiveElement = ref => {
      this.activeElement = ref
    }
    this.bindGridRef = ref => {
      this.grid = ref
    }
    this.bindRowGroup = ref => {
      this.rowGroup = ref
    }

    this.state = {
      activeLocation: {
        columnId: this.props.columns[0].id,
        region: this.props.navigableHeaders ? 'header' : 'body',
        rowId: this.props.navigableHeaders ? null : this.props.rows[0].id
      },
      visibleRowsEndIndex: this.props.rowsPerPage - 1,
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

  handleHeaderClick(event, location) {
    if (this.props.navigableHeaders) {
      event.preventDefault()
      this.setActiveLocation(location)
    }
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
    const {rowsPerPage, rows} = this.props
    let {visibleRowsEndIndex, visibleRowsStartIndex} = this.state
    const maxEndIndex = rows.length - 1

    if (visibleRowsEndIndex < maxEndIndex) {
      visibleRowsStartIndex = visibleRowsEndIndex + 1
      visibleRowsEndIndex = Math.min(visibleRowsStartIndex + rowsPerPage - 1, maxEndIndex)
      const rowId = this.props.rows[visibleRowsStartIndex].id
      this.setActiveLocation(
        {...this.state.activeLocation, region: 'body', rowId},
        {visibleRowsEndIndex, visibleRowsStartIndex}
      )
    }
  }

  movePageUp() {
    // go to previous page
    const {rowsPerPage, rows} = this.props
    let {visibleRowsEndIndex, visibleRowsStartIndex} = this.state
    const maxEndIndex = rows.length - 1

    if (visibleRowsStartIndex > 0) {
      visibleRowsStartIndex = Math.max(visibleRowsStartIndex - rowsPerPage, 0)
      visibleRowsEndIndex = Math.min(visibleRowsStartIndex + rowsPerPage - 1, maxEndIndex)
      const rowId = this.props.rows[visibleRowsEndIndex].id
      this.setActiveLocation(
        {...this.state.activeLocation, region: 'body', rowId},
        {visibleRowsEndIndex, visibleRowsStartIndex}
      )
    }
  }

  setPage(page) {
    const {rowsPerPage, rows} = this.props
    const lastPage = Math.ceil(rows.length / rowsPerPage)

    if (page >= 0 && page < lastPage) {
      const visibleRowsStartIndex = page * rowsPerPage
      const maxEndIndex = rows.length - 1
      const visibleRowsEndIndex = Math.min(visibleRowsStartIndex + rowsPerPage - 1, maxEndIndex)
      const rowId = this.props.rows[visibleRowsStartIndex].id
      this._setActiveLocation(
        {...this.state.activeLocation, region: 'body', rowId},
        {visibleRowsEndIndex, visibleRowsStartIndex}
      )
    }
  }

  _setActiveLocation(activeLocation, visibleRowIndices = null, stateCallback) {
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
      visibleRowsEndIndex = this.props.rowsPerPage - 1
    } else {
      visibleRowsEndIndex = this.state.visibleRowsEndIndex
      visibleRowsStartIndex = this.state.visibleRowsStartIndex

      const perPageOffset = this.props.rowsPerPage - 1

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

    this.setState({activeLocation, visibleRowsEndIndex, visibleRowsStartIndex}, () => {
      if (this.props.onActiveLocationChange) {
        this.props.onActiveLocationChange(activeLocation)
      }
      if (stateCallback) {
        stateCallback()
      }
    })
  }

  setActiveLocation(activeLocation, visibleRowIndices = null) {
    this._setActiveLocation(activeLocation, visibleRowIndices, () => {
      if (this.activeElement) {
        this.activeElement.focus()
      }
    })
  }

  render() {
    const pageCount = Math.ceil(this.props.rows.length / this.props.rowsPerPage)
    const currentPage = Math.floor(this.state.visibleRowsStartIndex / this.props.rowsPerPage)
    const pages = Array.from(Array(pageCount)).map((v, i) => (
      <PaginationButton
        key={i}
        onClick={() => {
          this.setPage(i)
        }}
        current={i === currentPage}
      >
        {i + 1}
      </PaginationButton>
    ))

    return (
      <div style={{display: 'inline-block'}}>
        <div
          className={styles.Grid}
          onKeyDown={this.handleKeyDown}
          ref={this.bindGridRef}
          role="grid"
        >
          <HeaderRow
            activeLocation={this.state.activeLocation}
            bindActiveElement={this.bindActiveElement}
            columns={this.props.columns}
            navigable={this.props.navigableHeaders}
            onClick={this.handleHeaderClick}
            renderColumnHeader={this.props.renderColumnHeader}
          />

          <div onClick={this.handleClick} ref={this.bindRowGroup} role="rowgroup" style={{display: 'table-row-group'}}>
            {getVisibleRows(this.props.rows, this.state).map(row => (
              <BodyRow
                activeLocation={this.state.activeLocation}
                bindActiveElement={this.bindActiveElement}
                className={styles.Row}
                columns={this.props.columns}
                key={row.id}
                renderCell={this.props.renderCell}
                row={row}
              />
            ))}
          </div>
        </div>

        <Pagination variant="compact" labelNext="Next Page" labelPrev="Previous Page">
          {pages}
        </Pagination>
      </div>
    )
  }
}
