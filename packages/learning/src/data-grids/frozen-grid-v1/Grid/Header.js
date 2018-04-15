import React, {PureComponent} from 'react'

import styles from './styles.css'
import ColumnHeader from './ColumnHeader'

export default class Header extends PureComponent {
  render() {
    const style = {
      height: `${this.props.height}px`,
      lineHeight: `${this.props.height}px`
    }

    return (
      <div className={styles.Header} style={style}>
        {this.props.columns.map(column => <ColumnHeader column={column} key={column.id} />)}
      </div>
    )
  }
}
