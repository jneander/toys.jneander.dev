import React, {Component} from 'react'

import Column from '../shared/DataTable/Column'
import styles from '../shared/DataTable/styles.css'

export default class DescriptionColumn extends Column {
  renderCell(props) {
    return (
      <td key={props.key} className={styles.Cell}>
        <a href="#" ref={props.focusableRef} tabIndex={props.tabIndex}>
          {props.data}
        </a>
      </td>
    )
  }
}
