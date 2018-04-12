import React, {Component} from 'react'

import ColumnHeader from './ColumnHeader'

export default class HeaderRow extends Component {
  render() {
    const {activeLocation, bindActiveElement} = this.props

    const headerIsActive = activeLocation.region === 'header'
    const isActiveLocation = columnId => headerIsActive && columnId === activeLocation.columnId
    const tabIndexFor = columnId => (isActiveLocation(columnId) ? '0' : '-1')
    const refFor = columnId => (isActiveLocation(columnId) ? bindActiveElement : undefined)

    return (
      <tr>
        {this.props.columns.map(column =>
          column.renderColumnHeader({
            focusableRef: refFor(column.id),
            key: column.id,
            tabIndex: tabIndexFor(column.id)
          })
        )}
      </tr>
    )
  }
}
