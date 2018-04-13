import React, {Component} from 'react'

export default class BodyRow extends Component {
  render() {
    if (this.props.hidden) {
      return null
    }

    const {activeLocation, bindActiveElement, row} = this.props

    const rowIsActive = activeLocation.rowId === row.id
    const isActiveLocation = columnId => rowIsActive && columnId === activeLocation.columnId
    const tabIndexFor = columnId => (isActiveLocation(columnId) ? '0' : '-1')
    const refFor = columnId => (isActiveLocation(columnId) ? bindActiveElement : undefined)

    return (
      <tr className={this.props.className}>
        {this.props.columns.map(column =>
          this.props.renderCell({
            column,
            key: column.id,
            focusableRef: refFor(column.id),
            row,
            tabIndex: tabIndexFor(column.id)
          })
        )}
      </tr>
    )
  }
}
