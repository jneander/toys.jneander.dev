import React from 'react';

import styles from './styles.css';

class HeaderCell extends React.Component {
  render () {
    const { column } = this.props;

    return (
      <div className={styles.HeaderCell}>
        <span>{ column.data.name }</span>
      </div>
    );
  }
}

export default HeaderCell;
