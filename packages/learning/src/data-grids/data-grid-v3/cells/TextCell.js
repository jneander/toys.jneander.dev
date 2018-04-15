import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class TextCell extends PureComponent {
  render() {
    const {column, row} = this.props

    return (
      <div
        aria-labelledby={`row-${row.id}-label column-${column.id}-label`}
        className={styles.Cell}
        ref={this.props.focusableRef}
        tabIndex={this.props.tabIndex}
      >
        {row[column.id] || '–'}
      </div>
    )
  }
}
