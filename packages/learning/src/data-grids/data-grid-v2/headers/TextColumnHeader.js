import React, {Component} from 'react'

import styles from '../DataGrid/styles.css'

export default class TextColumnHeader extends Component {
  render() {
    return (
      <div
        className={styles.ColumnHeader}
        id={`column-${this.props.column.id}-label`}
        ref={this.props.focusableRef}
        role="columnheader"
        tabIndex={this.props.tabIndex}
      >
        {this.props.column.name}
      </div>
    )
  }
}
