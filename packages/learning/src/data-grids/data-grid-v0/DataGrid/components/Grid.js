import React, {Component} from 'react'

import styles from '../styles/styles.css'
import Body from './Body'
import Header from './Header'

export default class Grid extends Component {
  render() {
    const classes = [styles.Grid]
    if (this.props.className) {
      classes.push(this.props.className)
    }

    return (
      <div
        className={classes.join(' ')}
        onScroll={this.props.onScroll}
        ref={this.props.measureRef}
        role="grid"
      >
        <Header
          cellFactory={this.props.headerCellFactory}
          className={this.props.gridHeaderClassName}
          columns={this.props.columns}
          height={this.props.headerHeight}
        />

        <Body
          bufferRowsAbove={this.props.bufferRowsAbove}
          bufferRowsBelow={this.props.bufferRowsBelow}
          cellFactory={this.props.rowCellFactory}
          className={this.props.gridBodyClassName}
          columns={this.props.columns}
          rowClassNames={this.props.rowClassNames}
          rowHeight={this.props.rowHeight}
          visibleRowRange={this.props.visibleRowRange}
          rows={this.props.rows}
        />
      </div>
    )
  }
}
