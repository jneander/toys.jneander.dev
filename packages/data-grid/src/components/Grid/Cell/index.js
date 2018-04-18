import React, {PureComponent} from 'react'
import themeable from '@instructure/ui-themeable'

import styles from './styles.css'

class Cell extends PureComponent {
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

export default themeable(() => ({}), styles)(Cell)
