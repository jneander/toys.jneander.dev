import React, {PureComponent} from 'react'

import styles from '../styles.css'

export default class StudentCell extends PureComponent {
  render() {
    const {column, row} = this.props

    return (
      <th className={styles.Cell} ref={this.props.focusableRef} scope="row" tabIndex={this.props.tabIndex}>
        {row[column.id]}
      </th>
    )
  }
}
