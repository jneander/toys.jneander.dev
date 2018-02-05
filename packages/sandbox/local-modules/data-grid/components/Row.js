import React from 'react';

import styles from '../styles/styles.css';
import RowCell from './RowCell';

class Row extends React.PureComponent {
  render () {
    const { cellFactory } = this.props;

    const style = {
      display: 'inline-block',
      height: `${this.props.height}px`
    };

    return (
      <div className={styles.Grid__Row} role="rowgroup">
        <div className={this.props.className} style={style} role="row">
          {
            this.props.columns.map((column, index) => (
              <RowCell
                as={cellFactory.getComponent(column, this.props.row)}
                column={column}
                row={this.props.row}
                columnId={column.id}
                key={index} />
            ))
          }
        </div>
      </div>
    );
  }
}

export default Row;
