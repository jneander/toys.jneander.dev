import React, {PureComponent} from 'react'

import searchResults from './searchResults'
import styles from './styles.css'

function isOutsidePage(rowIndex, state) {
  return rowIndex < state.visibleStartIndex || rowIndex > state.visibleEndIndex
}

function isActiveLocation(location, activeLocation) {
  const isSameColumn = location.colIndex === activeLocation.colIndex
  const isSameRow = location.rowIndex === activeLocation.rowIndex
  return isSameColumn && isSameRow
}

function tabIndex(location, activeLocation) {
  return isActiveLocation(location, activeLocation) ? '0' : '-1'
}

function mapNeighborLocations(location, props) {
  const {colIndex, rowIndex} = location
  const lastColIndex = 2
  const lastRowIndex = props.data.length - 1
  const map = {}

  if (rowIndex !== 0 || colIndex !== 0) {
    map.left = {
      colIndex: colIndex === 0 ? lastColIndex : colIndex - 1,
      rowIndex: colIndex === 0 ? rowIndex - 1 : rowIndex
    }
  }
  if (rowIndex !== 0 || colIndex !== lastColIndex) {
    map.right = {
      colIndex: colIndex === lastColIndex ? 0 : colIndex + 1,
      rowIndex: colIndex === lastColIndex ? rowIndex + 1 : rowIndex
    }
  }
  if (rowIndex !== lastRowIndex) {
    map.down = {colIndex, rowIndex: rowIndex + 1}
  }
  if (rowIndex !== 0) {
    map.up = {colIndex, rowIndex: rowIndex - 1}
  }

  return map
}

export default class ScrollableList extends PureComponent {
  static defaultProps = {
    data: searchResults,
    perPage: searchResults.length,
    wrapColumns: true
  }

  constructor(props) {
    super(props)

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.movePageDown = this.movePageDown.bind(this)
    this.movePageUp = this.movePageUp.bind(this)
    this.setActiveLocation = this.setActiveLocation.bind(this)

    this.state = {
      activeLocation: {
        colIndex: 0,
        rowIndex: 0
      },
      visibleEndIndex: this.props.perPage - 1,
      visibleStartIndex: 0
    }
  }

  handleKeyDown(event) {
    const key = event.which || event.keyCode
    const neighborLocations = mapNeighborLocations(this.state.activeLocation, this.props)

    switch (event.which || event.keyCode) {
      case 37: {
        // Left Arrow
        if (neighborLocations.left) {
          event.preventDefault()
          this.setActiveLocation(neighborLocations.left)
        }
        return
      }
      case 38: {
        // Up Arrow
        if (neighborLocations.up) {
          event.preventDefault()
          this.setActiveLocation(neighborLocations.up)
        }
        return
      }
      case 39: {
        // Right Arrow
        if (neighborLocations.right) {
          event.preventDefault()
          this.setActiveLocation(neighborLocations.right)
        }
        return
      }
      case 40: {
        // Down Arrow
        if (neighborLocations.down) {
          event.preventDefault()
          this.setActiveLocation(neighborLocations.down)
        }
        return
      }
      case 33: {
        // Page Up
        event.preventDefault()
        this.movePageUp()
        return
      }
      case 34: {
        // Page Down
        event.preventDefault()
        this.movePageDown()
        return
      }
    }
  }

  movePageDown() {
    // go to next page
    const {perPage, data} = this.props
    let {visibleEndIndex, visibleStartIndex} = this.state
    const maxEndIndex = data.length - 1

    if (visibleEndIndex < maxEndIndex) {
      visibleStartIndex = visibleEndIndex + 1
      visibleEndIndex = Math.min(visibleStartIndex + perPage - 1, maxEndIndex)
      this.setActiveLocation(
        {colIndex: this.state.activeLocation.colIndex, rowIndex: visibleStartIndex},
        {visibleEndIndex, visibleStartIndex}
      )
    }
  }

  movePageUp() {
    // go to previous page
    const {perPage, data} = this.props
    let {visibleEndIndex, visibleStartIndex} = this.state
    const maxEndIndex = data.length - 1

    if (visibleStartIndex > 0) {
      visibleStartIndex = Math.max(visibleStartIndex - perPage, 0)
      visibleEndIndex = Math.min(visibleStartIndex + perPage - 1, maxEndIndex)
      this.setActiveLocation(
        {colIndex: this.state.activeLocation.colIndex, rowIndex: visibleEndIndex},
        {visibleEndIndex, visibleStartIndex}
      )
    }
  }

  setActiveLocation(location, visibleIndices = null) {
    let visibleEndIndex, visibleStartIndex

    if (visibleIndices) {
      visibleEndIndex = visibleIndices.visibleEndIndex
      visibleStartIndex = visibleIndices.visibleStartIndex
    } else {
      visibleEndIndex = this.state.visibleEndIndex
      visibleStartIndex = this.state.visibleStartIndex

      const perPageOffset = this.props.perPage - 1

      if (location.rowIndex < visibleStartIndex) {
        visibleStartIndex = location.rowIndex
      } else if (location.rowIndex > visibleStartIndex + perPageOffset) {
        visibleStartIndex = Math.max(location.rowIndex - perPageOffset, 0)
      }

      visibleEndIndex = Math.min(visibleStartIndex + perPageOffset, this.props.data.length - 1)
    }

    this.setState(
      {
        activeLocation: location,
        visibleEndIndex,
        visibleStartIndex
      },
      () => {
        this.activeCell.focus()
      }
    )
  }

  render() {
    const refForLocation = location => {
      if (isActiveLocation(location, this.state.activeLocation)) {
        return ref => {
          this.activeCell = ref
        }
      }
      return null
    }

    const onClickForLocation = location => {
      return () => {
        this.setActiveLocation(location)
      }
    }

    return (
      <div className={styles.Root}>
        <h3 className={styles.ExampleHeading}>Example 3: Scrollable Search Results</h3>

        <p>
          This example demonstrates how a grid can make moving through an infinitely large data set
          as easy and efficient for keyboard users as it is for mouse users. It presents a
          hypothetical set of search results for W3C resources about WAI-ARIA.
        </p>

        <h4 id="grid_label">Search Results for "W3C WAI-ARIA"</h4>

        <div className={styles.ResultsSummary}>
          Showing results {this.state.visibleStartIndex + 1} to {this.state.visibleEndIndex + 1} of{' '}
          {this.props.data.length}
        </div>

        <div aria-labelledby="grid_label" aria-rowcount={this.props.data.length} role="grid">
          {this.props.data.map((datum, rowIndex) => {
            const classNames = [styles.Row]
            if (isOutsidePage(rowIndex, this.state)) {
              classNames.push(styles.Hidden)
            }

            return (
              <div
                aria-rowindex={rowIndex + 1}
                className={classNames.join(' ')}
                key={rowIndex}
                role="row"
              >
                <div
                  aria-colindex="1"
                  className={styles.GridCell}
                  onKeyDown={this.handleKeyDown}
                  role="gridcell"
                >
                  <h5 className={styles.ResultHeader}>
                    <a
                      href={datum.linkHref}
                      ref={refForLocation({colIndex: 0, rowIndex})}
                      tabIndex={tabIndex({colIndex: 0, rowIndex}, this.state.activeLocation)}
                      onClick={onClickForLocation({colIndex: 0, rowIndex})}
                    >
                      {datum.linkText}
                    </a>
                  </h5>
                </div>{' '}
                <span
                  aria-colindex="2"
                  className={styles.GridCell}
                  onClick={onClickForLocation({colIndex: 1, rowIndex})}
                  onKeyDown={this.handleKeyDown}
                  ref={refForLocation({colIndex: 1, rowIndex})}
                  role="gridcell"
                  tabIndex={tabIndex({colIndex: 1, rowIndex}, this.state.activeLocation)}
                >
                  {datum.source}
                </span>{' '}
                <span
                  aria-colindex="3"
                  className={styles.GridCell}
                  onClick={onClickForLocation({colIndex: 2, rowIndex})}
                  onKeyDown={this.handleKeyDown}
                  ref={refForLocation({colIndex: 2, rowIndex})}
                  role="gridcell"
                  tabIndex={tabIndex({colIndex: 2, rowIndex}, this.state.activeLocation)}
                >
                  {datum.summary}
                </span>
              </div>
            )
          })}
        </div>

        <div className={styles.Pagination}>
          <button disabled={this.state.visibleStartIndex === 0} onClick={this.movePageUp}>
            Previous
          </button>{' '}
          <button
            disabled={this.state.visibleEndIndex === this.props.data.length - 1}
            onClick={this.movePageDown}
          >
            Next
          </button>
        </div>
      </div>
    )
  }
}
