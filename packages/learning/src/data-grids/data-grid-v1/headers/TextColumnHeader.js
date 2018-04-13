import React, {Component} from 'react'

import styles from '../styles.css'

export default class TextColumnHeader extends Component {
  render() {
    return (
      <th
        className={styles.ColumnHeader}
        ref={this.props.focusableRef}
        tabIndex={this.props.tabIndex}
      >
        {this.props.column.name}
      </th>
    )
  }
}
