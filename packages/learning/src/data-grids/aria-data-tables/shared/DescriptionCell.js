import React, {Component} from 'react'

import styles from './DataTable/styles.css'

export default class DescriptionCell extends Component {
  render() {
    const {column, row} = this.props

    return (
      <td className={styles.Cell}>
        <a href="#" ref={this.props.focusableRef} tabIndex={this.props.tabIndex}>
          {row[column.id]}
        </a>
      </td>
    )
  }
}
