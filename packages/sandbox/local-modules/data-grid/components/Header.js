import React from 'react';

import styles from '../styles/styles.css';
import HeaderCell from './HeaderCell';

class Header extends React.Component {
  render () {
    const { cellFactory } = this.props;

    const classes = [];
    if (this.props.className) {
      classes.push(this.props.className);
    }

    const style = {
      display: 'inline-block',
      height: `${this.props.height}px`
    };

    return (
      <div className={styles.Grid__Header} role="rowgroup">
        <div className={this.props.className} style={style} role="row">
          {
            this.props.columns.map(column => (
              <HeaderCell
                as={cellFactory.getComponent(column)}
                column={column}
                key={column.id} />
            ))
          }
        </div>
      </div>
    );
  }
}

export default Header;
