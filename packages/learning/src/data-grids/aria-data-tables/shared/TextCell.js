import React, {Component} from 'react'

import styles from './DataTable/styles.css'

export default class TextCell extends Component {
  render() {
    const {column, row} = this.props

    return (
      <td className={styles.Cell} ref={this.props.focusableRef} tabIndex={this.props.tabIndex}>
        {row[column.id]}
      </td>
    )
  }
}
