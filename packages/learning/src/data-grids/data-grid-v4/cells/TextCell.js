import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class TextCell extends PureComponent {
  render() {
    const {column, row} = this.props

    return (
      <span
        aria-labelledby={`row-${row.id}-label column-${column.id}-label`}
        className={`${styles.Cell} ${styles.TextCell}`}
        ref={this.props.focusableRef}
        role="gridcell"
        tabIndex={this.props.tabIndex}
      >
        {row.data[column.id] || '–'}
      </span>
    )
  }
}
