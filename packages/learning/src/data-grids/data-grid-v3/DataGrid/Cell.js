import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class Cell extends PureComponent {
  render() {
    const style = {
      width: `${this.props.column.width}px`
    }

    const classNames = [styles.Cell]
    if (this.props.isActiveLocation) {
      classNames.push(styles.CellActive)
    }

    return (
      <div className={classNames.join(' ')} role="gridcell" style={style}>
        {this.props.children}
      </div>
    )
  }
}
