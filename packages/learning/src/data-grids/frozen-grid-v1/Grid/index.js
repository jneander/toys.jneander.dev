import React, {PureComponent} from 'react'
import {ScrollSync, ScrollSyncPane} from 'react-scroll-sync'

import Body from './Body'
import Header from './Header'
import styles from './styles.css'

export default class Grid extends PureComponent {
  render() {
    return (
      <ScrollSync vertical={false}>
        <div className={styles.Grid}>
          <ScrollSyncPane>
            <Header columns={this.props.columns} height={this.props.headerHeight} />
          </ScrollSyncPane>

          <ScrollSyncPane>
            <Body
              columns={this.props.columns}
              headerHeight={this.props.headerHeight}
              rowHeight={this.props.rowHeight}
              rows={this.props.rows}
            />
          </ScrollSyncPane>
        </div>
      </ScrollSync>
    )
  }
}
