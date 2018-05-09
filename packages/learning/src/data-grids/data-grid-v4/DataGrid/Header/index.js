import React, {PureComponent} from 'react'

import styles from './styles.css'

function getLocationFromEvent(event, self) {
  const columnIndex = [].findIndex.call(self.gridRow.children, header =>
    header.contains(event.target)
  )

  if (columnIndex === -1) {
    return null // this should never occur
  }

  return {
    columnId: self.props.columns[columnIndex].id,
    region: 'header',
    rowId: null
  }
}

export default class Header extends PureComponent {
  constructor(props) {
    super(props)

    this.bindGridRow = ref => {
      this.gridRow = ref
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    const location = getLocationFromEvent(event, this)
    if (location) {
      this.props.onClick(event, location)
    }
  }

  render() {
    const {activeLocation, bindActiveElement, columns} = this.props

    const isHeaderActive = activeLocation.region === 'header'

    const style = {
      height: `${this.props.height}px`
    }

    const columnHeaders = []
    let columnOffset = 0

    for (let c = 0; c < columns.length; c++) {
      const column = columns[c]
      const isActiveColumn = activeLocation.columnId === column.id
      const isActiveLocation = isActiveColumn && isHeaderActive

      const columnHeader = this.props.renderColumnHeader({
        column,
        focusableRef: isActiveLocation ? bindActiveElement : null,
        key: column.id,
        tabIndex: isActiveLocation ? '0' : '-1'
      })

      const props = {
        column: column,
        columnOffset: columnOffset,
        height: this.props.height,
        isActiveColumn: isActiveColumn,
        isActiveLocation: isActiveLocation,
        isFirstColumn: c === 0,
        isLastColumn: c === columns.length - 1,
        key: column.id
      }

      columnHeaders.push(React.cloneElement(columnHeader, props))

      columnOffset += column.width - 1 // account for border width
    }

    return (
      <div
        className={styles.Header}
        onClick={this.props.onClick && this.handleClick}
        ref={this.bindGridRow}
        role="row"
        style={style}
      >
        {columnHeaders}
      </div>
    )
  }
}
