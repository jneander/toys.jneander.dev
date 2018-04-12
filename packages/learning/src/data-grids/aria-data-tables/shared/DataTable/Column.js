import React, {Component} from 'react'

import styles from './styles.css'

export default class Column {
  constructor(attr) {
    this.attr = {...attr}

    this.renderCell = this.renderCell.bind(this)
    this.renderColumnHeader = this.renderColumnHeader.bind(this)
  }

  get id() {
    return this.attr.id
  }

  renderCell(props) {
    return (
      <td
        className={styles.Cell}
        key={props.key}
        ref={props.focusableRef}
        tabIndex={props.tabIndex}
      >
        {props.data}
      </td>
    )
  }

  renderColumnHeader(props) {
    return (
      <th {...props} className={styles.ColumnHeader}>
        {this.attr.name}
      </th>
    )
  }
}
