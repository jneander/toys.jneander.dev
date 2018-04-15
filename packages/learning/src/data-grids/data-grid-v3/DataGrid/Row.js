import React, {Component} from 'react'

import styles from './styles.css'
import Cell from './Cell'

export default class Row extends Component {
  shouldComponentUpdate(nextProps) {
    const {activeLocation: currentLocation} = this.props
    const {activeLocation: nextLocation} = nextProps

    if (nextLocation === currentLocation) {
      return false
    }

    if (currentLocation.rowId === this.props.row.id && nextLocation.rowId !== this.props.row.id) {
      return true
    }

    if (nextLocation.rowId === this.props.row.id) {
      return true
    }

    return false
  }

  render() {
    const {activeLocation, bindActiveElement, row} = this.props

    const rowIsActive = activeLocation.rowId === row.id
    const isActiveLocation = columnId => rowIsActive && columnId === activeLocation.columnId
    const tabIndexFor = columnId => (isActiveLocation(columnId) ? '0' : '-1')
    const refFor = columnId => (isActiveLocation(columnId) ? bindActiveElement : undefined)

    const rowElementId = `row-${row.id}-label`

    const style = {
      display: 'inline-block',
      lineHeight: `${this.props.height}px`,
      height: `${this.props.height}px`
    }

    const classNames = [styles.Row]
    classNames.push(this.props.even ? styles.RowEven : styles.RowOdd)

    return (
      <div className={classNames.join(' ')} style={style}>
        {this.props.columns.map(column => (
          <Cell column={column} key={column.id}>
            {this.props.renderCell({
              'aria-labelledby': `column-${column.id}-label,${rowElementId}`,
              column,
              focusableRef: refFor(column.id),
              row,
              tabIndex: tabIndexFor(column.id)
            })}
          </Cell>
        ))}
      </div>
    )
  }
}
