import React, {PureComponent} from 'react'
import {ScrollSync, ScrollSyncPane} from 'react-scroll-sync'

import KeyCodes from './KeyCodes'
import GridContainer from './GridContainer'
import styles from './styles.css'

export default class Grid extends PureComponent {
  static defaultProps = {
    navigableHeaders: false,
    rowsPerPage: 5
  }

  constructor(props) {
    super(props)

    this.handleGridClick = this.handleGridClick.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)

    this.bindActiveElement = ref => {
      this.activeElement = ref
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

  handleGridClick(event, location) {
    event.preventDefault()
    this.setActiveLocation(location)
  }

  handleKeyDown(event) {
    const key = event.which || event.keyCode
    let location = this.state.activeLocation

    const columnIndex = this.props.columns.findIndex(column => column.id === location.columnId)
    const rowIndex = this.props.rows.findIndex(row => row.id === location.rowId)

    // console.log(location, key)

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
    return (
      <ScrollSync>
        <div className={styles.Grid} onKeyDown={this.handleKeyDown}>
          <GridContainer
            {...this.props}
            activeLocation={this.state.activeLocation}
            bindActiveElement={this.bindActiveElement}
            columns={this.props.columns.slice(0, 1)}
            frozen
            onClick={this.handleGridClick}
          />

          <GridContainer
            {...this.props}
            activeLocation={this.state.activeLocation}
            bindActiveElement={this.bindActiveElement}
            columns={this.props.columns.slice(1)}
            onClick={this.handleGridClick}
          />
        </div>
      </ScrollSync>
    )
  }
}
