import React, {Component} from 'react'

import styles from './styles.css'

export default class RowCell extends Component {
  render() {
    const text = this.props.row.data[this.props.column.id]

    return (
      <div className={styles.RowCell}>
        <span>{text}</span>
      </div>
    )
  }
}
