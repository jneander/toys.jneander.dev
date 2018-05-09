import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class StudentCell extends PureComponent {
  render() {
    const {column, row} = this.props

    return (
      <span
        aria-labelledby={`column-${column.id}-label`}
        className={`${styles.Cell} ${styles.StudentCell}`}
        id={`row-${row.id}-label`}
        ref={this.props.focusableRef}
        role="rowheader"
        tabIndex={this.props.tabIndex}
      >
        {row.data.studentName}
      </span>
    )
  }
}
