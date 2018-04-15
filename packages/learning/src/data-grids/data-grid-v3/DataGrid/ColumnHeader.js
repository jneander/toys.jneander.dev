import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class ColumnHeader extends PureComponent {
  render() {
    const style = {
      width: `${this.props.column.width}px`
    }

    const classNames = [styles.ColumnHeader]
    if (this.props.isActiveLocation) {
      classNames.push(styles.CellActive)
    }

    return (
      <div className={classNames.join(' ')} style={style}>
        {this.props.children}
      </div>
    )
  }
}
