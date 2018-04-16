import React, {PureComponent} from 'react'
import {ScrollSync, ScrollSyncPane} from 'react-scroll-sync'

import KeyCodes from './KeyCodes'
import GridContainer from './GridContainer'
import styles from './styles.css'

export default class Grid extends PureComponent {
  static defaultProps = {
    navigableHeaders: false,
    rowsPerPage: 10
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
      }
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
      case KeyCodes.HOME:
        event.preventDefault()
        location = {
          columnId: this.props.columns[0].id,
          region: 'body',
          rowId: this.props.rows[0].id
        }
        break
      case KeyCodes.END:
        event.preventDefault()
        const {columns, rows} = this.props
        location = {
          columnId: columns[columns.length - 1].id,
          region: 'body',
          rowId: rows[rows.length - 1].id
        }
        break
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
    const {activeLocation} = this.state

    let nextLocation = activeLocation

    if (activeLocation.region === 'header') {
      const nextRow = rows[rowsPerPage - 1]
      nextLocation = {columnId: activeLocation.columnId, region: 'body', rowId: nextRow.id}
    } else {
      const rowIndex = rows.findIndex(row => row.id === activeLocation.rowId)
      const nextRowIndex = Math.min(rowIndex + rowsPerPage, rows.length - 1)

      if (nextRowIndex > rowIndex) {
        const nextRow = rows[nextRowIndex]
        nextLocation = {columnId: activeLocation.columnId, region: 'body', rowId: nextRow.id}
      }
    }

    if (nextLocation !== activeLocation) {
      this.setActiveLocation(nextLocation)
    }
  }

  movePageUp() {
    // go to previous page
    const {rowsPerPage, rows} = this.props
    const {activeLocation} = this.state

    if (activeLocation.region === 'header') {
      return
    }

    let nextLocation = activeLocation
    const rowIndex = rows.findIndex(row => row.id === activeLocation.rowId)
    const nextRowIndex = Math.max(rowIndex - rowsPerPage, 0)

    if (nextRowIndex < rowIndex) {
      const nextRow = rows[nextRowIndex]
      const nextLocation = {columnId: activeLocation.columnId, region: 'body', rowId: nextRow.id}
      this.setActiveLocation(nextLocation)
    }
  }

  setPage(page) {
    const {rowsPerPage, rows} = this.props
    const lastPage = Math.ceil(rows.length / rowsPerPage)

    if (page >= 0 && page < lastPage) {
      const rowId = this.props.rows[page * rowsPerPage].id
      this._setActiveLocation({...this.state.activeLocation, region: 'body', rowId})
    }
  }

  _setActiveLocation(activeLocation, stateCallback) {
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

    this.setState({activeLocation}, () => {
      if (this.props.onActiveLocationChange) {
        this.props.onActiveLocationChange(activeLocation)
      }
      if (stateCallback) {
        stateCallback()
      }
    })
  }

  setActiveLocation(activeLocation) {
    this._setActiveLocation(activeLocation, () => {
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
