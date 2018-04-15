import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class ColumnHeader extends PureComponent {
  render() {
    const style = {
      width: `${this.props.column.width}px`
    }

    return (
      <div className={styles.ColumnHeader} style={style}>
        {this.props.children}
      </div>
    )
  }
}
