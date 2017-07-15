import React from 'react';

import styles from 'js/apps/slick-grid/styles/styles.css';

class HeaderCell extends React.Component {
  render () {
    const Cell = this.props.as;

    const style = {
      width: `${this.props.column.width}px`
    };

    return (
      <div className={styles.Grid__HeaderCell} style={style} role="columnheader">
        <Cell column={this.props.column} />
      </div>
    );
  }
}

export default HeaderCell;
