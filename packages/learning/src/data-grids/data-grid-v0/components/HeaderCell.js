import React, {Component} from 'react'

import styles from './styles.css'

export default class HeaderCell extends Component {
  render() {
    const {column} = this.props

    return (
      <div className={styles.HeaderCell}>
        <span>{column.data.name}</span>
      </div>
    )
  }
}
