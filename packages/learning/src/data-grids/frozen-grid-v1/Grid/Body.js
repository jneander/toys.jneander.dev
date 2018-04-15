import React, {PureComponent} from 'react'

import styles from './styles.css'
import Row from './Row'

export default class Body extends PureComponent {
  render() {
    const style = {
      flexBasis: '364px',
      height: `${this.props.rows.length * this.props.rowHeight}px`,
      maxHeight: '364px',
      width: `${this.props.columns.reduce((sum, column) => sum + column.width, 0)}px`
    }

    return (
      <div className={styles.Body} style={style}>
        {this.props.rows.map((row, index) => (
          <Row
            columns={this.props.columns}
            even={index % 2 === 0}
            height={this.props.rowHeight}
            key={row.id}
            row={row}
          />
        ))}
      </div>
    )
  }
}
