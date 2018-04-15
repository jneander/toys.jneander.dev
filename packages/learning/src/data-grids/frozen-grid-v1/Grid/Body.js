import React, {PureComponent} from 'react'

import styles from './styles.css'
import Row from './Row'

export default class Body extends PureComponent {
  render() {
    const style = {
      top: `${this.props.headerHeight}px`
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
