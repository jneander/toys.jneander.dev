import React from 'react';
import Measure from 'react-measure';

import styles from '../styles/styles.css';
import Body from './Body';
import Header from './Header';

function range (start, end) {
  const list = []
  for (var i = start; i <= end; i++) {
    list.push(i);
  }
  return list;
}

class Grid extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      dimensions: {
        height: 0,
        width: 0
      },
      totalRowHeight: this.props.rows.length * this.props.rowHeight,
      totalGridHeight: this.props.rows.length * this.props.rowHeight + this.props.headerHeight,
      bufferRowsAbove: 0,
      bufferRowsBelow: 0
    };

    this.handleGridScroll = this.handleGridScroll.bind(this);
    this.handleMeasure = (dimensions) => { this.setState({ dimensions }) };
  }

  handleGridScroll (event) {
    const visibleRowsHeight = event.currentTarget.clientHeight - this.props.headerHeight;

    const visibleHeight = event.currentTarget.clientHeight;
    const hiddenPixelsAbove = event.currentTarget.scrollTop;
    const hiddenPixelsBelow = this.state.totalRowHeight - hiddenPixelsAbove - visibleRowsHeight;

    const bufferRowsAbove = Math.floor(hiddenPixelsAbove / this.props.rowHeight);
    const bufferRowsBelow = Math.floor(hiddenPixelsBelow / this.props.rowHeight);
    const visibleRowCount = this.props.rows.length - bufferRowsAbove - bufferRowsBelow;

    this.props.debug({
      hiddenPixelsAbove,
      hiddenPixelsBelow,
      bufferRowsAbove,
      bufferRowsBelow,
      totalGridHeight: this.state.totalGridHeight,
      totalRowHeight: this.state.totalRowHeight,
      visibleHeight,
      visibleRowCount
    });

    const newStates = [];

    if (bufferRowsAbove !== this.state.bufferRowsAbove) {
      newStates.push({ bufferRowsAbove: bufferRowsAbove });
    }

    if (bufferRowsBelow !== this.state.bufferRowsBelow) {
      newStates.push({ bufferRowsBelow: bufferRowsBelow });
    }

    if (newStates.length) {
      this.setState(Object.assign({}, ...newStates));
    }
  }

  render () {
    const classes = [styles.Grid];
    if (this.props.className) {
      classes.push(this.props.className);
    }

    const firstRowVisible = this.state.bufferRowsAbove;
    const lastRowVisible = this.props.rows.length - this.state.bufferRowsBelow - 1;

    return (
      <Measure onMeasure={this.handleMeasure} whitelist={['width', 'height']}>
        <div className={classes.join(' ')} onScroll={this.handleGridScroll} role="grid" aria-rowcount={this.props.rows.length} aria-colcount={this.props.columns.length}>
          <Header
            cellFactory={this.props.headerCellFactory}
            className={this.props.gridHeaderClassName}
            columns={this.props.columns}
            height={this.props.headerHeight} />

          <Body
            bufferRowsAbove={this.state.bufferRowsAbove}
            bufferRowsBelow={this.state.bufferRowsBelow}
            cellFactory={this.props.rowCellFactory}
            className={this.props.gridBodyClassName}
            columns={this.props.columns}
            rowClassNames={this.props.rowClassNames}
            rowHeight={this.props.rowHeight}
            visibleRowRange={range(firstRowVisible, lastRowVisible)}
            rows={this.props.rows} />
        </div>
      </Measure>
    );
  }
}

export default Grid;
