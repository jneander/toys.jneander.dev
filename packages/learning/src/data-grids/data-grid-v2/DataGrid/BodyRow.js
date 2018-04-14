import React, {PureComponent} from 'react'

export default class BodyRow extends PureComponent {
  render() {
    const {activeLocation, bindActiveElement, row} = this.props

    const rowIsActive = activeLocation.rowId === row.id
    const isActiveLocation = columnId => rowIsActive && columnId === activeLocation.columnId
    const tabIndexFor = columnId => (isActiveLocation(columnId) ? '0' : '-1')
    const refFor = columnId => (isActiveLocation(columnId) ? bindActiveElement : undefined)

    const rowElementId = `row-${row.id}-label`

    return (
      <div className={this.props.className} role="row">
        {this.props.columns.map(column =>
          this.props.renderCell({
            'aria-labelledby': `column-${column.id}-label,${rowElementId}`,
            column,
            key: column.id,
            focusableRef: refFor(column.id),
            row,
            tabIndex: tabIndexFor(column.id)
          })
        )}
      </div>
    )
  }
}
