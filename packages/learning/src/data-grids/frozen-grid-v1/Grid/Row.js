import React, {PureComponent} from 'react'

import styles from './styles.css'
import Cell from './Cell'

export default class Row extends PureComponent {
  render() {
    const style = {
      display: 'inline-block',
      lineHeight: `${this.props.height}px`,
      height: `${this.props.height}px`
    }

    const classNames = [styles.Row]
    classNames.push(this.props.even ? styles.RowEven : styles.RowOdd)

    return (
      <div className={classNames.join(' ')} style={style}>
        {this.props.columns.map(column => (
          <Cell column={column} row={this.props.row} key={column.id} />
        ))}
      </div>
    )
  }
}
