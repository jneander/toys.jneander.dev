import React, {PureComponent} from 'react'

import styles from './styles.css'
import ColumnHeader from './ColumnHeader'

export default class Header extends PureComponent {
  render() {
    const {cellFactory} = this.props

    const classes = []
    if (this.props.className) {
      classes.push(this.props.className)
    }

    const style = {
      display: 'inline-block',
      flexBasis: '36px',
      height: '36px',
      lineHeight: '36px'
    }

    return (
      <div className={styles.Header} style={style}>
        {this.props.columns.map(column => <ColumnHeader column={column} key={column.id} />)}
      </div>
    )
  }
}
