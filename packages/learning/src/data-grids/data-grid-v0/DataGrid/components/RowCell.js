import React, {Component} from 'react'

import styles from '../styles/styles.css'

export default class RowCell extends Component {
  render() {
    const Cell = this.props.as

    const style = {
      width: `${this.props.column.width}px`
    }

    return (
      <div className={styles.Grid__RowCell} style={style} role="gridcell">
        <Cell column={this.props.column} row={this.props.row} />
      </div>
    )
  }
}
