import React, {PureComponent} from 'react'

import styles from './css/styles.css'

export default class TextCell extends PureComponent {
  bindTableCell = ref => {
    this.tableCell = ref
  }

  focus = () => {
    this.tableCell.focus()
  }

  render() {
    return (
      <td
        className={styles.GridCell}
        ref={this.bindTableCell}
        tabIndex={this.props.isActive ? '0' : '-1'}
      >
        {this.props.content}
      </td>
    )
  }
}
