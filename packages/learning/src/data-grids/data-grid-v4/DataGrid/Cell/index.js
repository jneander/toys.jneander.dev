import React, {PureComponent} from 'react'

import styles from './styles.css'

export default class Cell extends PureComponent {
  render() {
    const classNames = [styles.Cell]
    if (this.props.isActiveLocation) {
      classNames.push(styles.CellActive)
    }
    if (this.props.isActiveColumn) {
      classNames.push(styles.ActiveColumn)
    }
    if (this.props.isActiveRow) {
      classNames.push(styles.ActiveRow)
    }
    if (this.props.isFirstRow) {
      classNames.push(styles.FirstRow)
    }
    if (this.props.isLastRow) {
      classNames.push(styles.LastRow)
    }
    if (this.props.isFirstColumn) {
      classNames.push(styles.FirstColumn)
    }
    if (this.props.isLastColumn) {
      classNames.push(styles.LastColumn)
    }
    if (this.props.isEvenRow) {
      classNames.push(styles.EvenRow)
    } else {
      classNames.push(styles.OddRow)
    }

    const style = {
      height: `${this.props.height}px`,
      left: `${this.props.columnOffset}px`,
      position: 'absolute',
      top: `${this.props.rowOffset}px`,
      width: `${this.props.column.width}px`
    }

    return (
      <div className={classNames.join(' ')} role="gridcell" style={style}>
        {this.props.children}
      </div>
    )
  }
}
