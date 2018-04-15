import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class TextColumnHeader extends PureComponent {
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
