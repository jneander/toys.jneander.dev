import React, {PureComponent} from 'react'
import themeable from '@instructure/ui-themeable'

import styles from './styles.css'

class ColumnHeader extends PureComponent {
  render() {
    const style = {
      width: `${this.props.column.width}px`
    }

    const classNames = [styles.ColumnHeader]
    if (this.props.isActiveLocation) {
      classNames.push(styles.CellActive)
    }

    return (
      <div className={classNames.join(' ')} role="columnheader" style={style}>
        {this.props.children}
      </div>
    )
  }
}

export default themeable(() => ({}), styles)(ColumnHeader)
