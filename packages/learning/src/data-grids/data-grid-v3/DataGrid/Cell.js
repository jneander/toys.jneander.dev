import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class Cell extends PureComponent {
  render() {
    const style = {
      width: `${this.props.column.width}px`
    }

    return (
      <div className={styles.Cell} style={style}>
        {this.props.children}
      </div>
    )
  }
}
