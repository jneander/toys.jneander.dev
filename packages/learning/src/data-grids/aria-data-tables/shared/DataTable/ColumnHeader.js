import React, {Component} from 'react'

import styles from './styles.css'

export default class ColumnHeader extends Component {
  render() {
    return <th className={styles.ColumnHeader}>{this.props.column.name}</th>
  }
}
