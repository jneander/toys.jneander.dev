import React, {PureComponent} from 'react'

import Body from './Body'
import Header from './Header'
import styles from './styles.css'

export default class Grid extends PureComponent {
  render() {
    return (
      <div
        className={styles.Grid}
        style={{overflowX: 'scroll', display: 'flex', flexDirection: 'column'}}
      >
        <Header columns={this.props.columns} />

        <Body columns={this.props.columns} rowHeight={32} rows={this.props.rows} />
      </div>
    )
  }
}
