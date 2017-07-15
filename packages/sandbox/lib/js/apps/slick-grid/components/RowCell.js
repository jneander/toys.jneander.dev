import React from 'react';

import styles from 'js/apps/slick-grid/styles/styles.css';

class RowCell extends React.Component {
  render () {
    const Cell = this.props.as;

    const style = {
      width: `${this.props.column.width}px`
    };

    return (
      <div className={styles.Grid__RowCell} style={style} role="gridcell">
        <Cell column={this.props.column} row={this.props.row} />
      </div>
    );
  }
}

export default RowCell;
