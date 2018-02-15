import React from 'react'

import styles from './styles.css'

class RowCell extends React.Component {
  render() {
    const text = this.props.row.data[this.props.column.id]

    return (
      <div className={styles.RowCell}>
        <span>{text}</span>
      </div>
    )
  }
}

export default RowCell
