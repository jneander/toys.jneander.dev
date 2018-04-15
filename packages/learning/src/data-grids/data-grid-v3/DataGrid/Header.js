import React, {PureComponent} from 'react'

import styles from './styles.css'
import ColumnHeader from './ColumnHeader'

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
    const {activeLocation, bindActiveElement} = this.props

    const headerIsActive = activeLocation.region === 'header'
    const isActiveLocation = columnId => headerIsActive && columnId === activeLocation.columnId
    const tabIndexFor = columnId => (isActiveLocation(columnId) ? '0' : '-1')
    const refFor = columnId => (isActiveLocation(columnId) ? bindActiveElement : undefined)

    const style = {
      height: `${this.props.height}px`,
      lineHeight: `${this.props.height}px`
    }

    return (
      <div
        className={styles.Header}
        onClick={this.props.onClick && this.handleClick}
        ref={this.bindGridRow}
        style={style}
      >
        {this.props.columns.map(column => (
          <ColumnHeader column={column} key={column.id}>
            {this.props.renderColumnHeader({
              column,
              focusableRef: refFor(column.id),
              key: column.id,
              tabIndex: tabIndexFor(column.id)
            })}
          </ColumnHeader>
        ))}
      </div>
    )
  }
}
