import React, {Component} from 'react'

import ColumnHeader from './ColumnHeader'

export default class HeaderRow extends Component {
  render() {
    return (
      <tr data-fixed="true">
        {this.props.columns.map(column => column.renderColumnHeader({key: column.id}))}
      </tr>
    )
  }
}
