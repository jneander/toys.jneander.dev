import React from 'react'
import themeable from '@instructure/ui-themeable'

import styles from '../styles/styles.css'
import theme from '../theme'

class RowCell extends React.Component {
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

export default themeable(theme, styles)(RowCell)
