import React, {Component} from 'react'

import styles from '../styles/styles.css'

export default class HeaderCell extends Component {
  render() {
    const Cell = this.props.as

    const style = {
      width: `${this.props.column.width}px`
    }

    return (
      <div className={styles.Grid__HeaderCell} style={style} role="columnheader">
        <Cell column={this.props.column} />
      </div>
    )
  }
}
