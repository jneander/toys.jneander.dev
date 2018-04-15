import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class Cell extends PureComponent {
  render() {
    const style = {
      width: `${this.props.column.width}px`
    }

    return (
      <div className={styles.Cell} style={style}>
        <div style={{padding: '0 0.5em'}}>{this.props.row[this.props.column.id] || '–'}</div>
      </div>
    )
  }
}
