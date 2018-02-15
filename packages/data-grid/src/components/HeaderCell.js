import React from 'react'
import themeable from '@instructure/ui-themeable'

import styles from '../styles/styles.css'
import theme from '../theme'

class HeaderCell extends React.Component {
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

export default themeable(theme, styles)(HeaderCell)
