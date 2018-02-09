import React from 'react';
import themeable from '@instructure/ui-themeable';

import styles from '../styles/styles.css';
import theme from '../theme';
import Row from './Row';

function getRowClassname (index, rowClassNames = []) {
  if (rowClassNames.length) {
    return rowClassNames[index % rowClassNames.length];
  }
}

class Body extends React.PureComponent {
  render () {
    const classes = [styles.Grid__Body];
    if (this.props.className) {
      classes.push(this.props.className);
    }

    const visibleRows = this.props.visibleRowRange.map(index => (
      this.props.rows[index]
    ));

    const style = {
      height: `${this.props.rows.length * this.props.rowHeight}px`
    };

    const bufferHeightAbove = this.props.rowHeight * (this.props.bufferRowsAbove || 0);
    const bufferHeightBelow = this.props.rowHeight * (this.props.bufferRowsBelow || 0);

    const renderedRows = visibleRows.map((row, index) => {
      const rowIndex = this.props.bufferRowsAbove + index;
      return (
        <Row
          cellFactory={this.props.cellFactory}
          className={getRowClassname(rowIndex, this.props.rowClassNames)}
          columns={this.props.columns}
          height={this.props.rowHeight}
          key={rowIndex}
          row={row}
          rowIndex={rowIndex} />
      );
    });

    return (
      <div className={classes.join(' ')} style={style}>
        <div className="Grid__BufferAbove" style={{ height: `${bufferHeightAbove}px` }} />
        { renderedRows }
        <div className="Grid__BufferBelow" style={{ height: `${bufferHeightBelow}px` }} />
      </div>
    );
  }
}

export default themeable(theme, styles)(Body);
