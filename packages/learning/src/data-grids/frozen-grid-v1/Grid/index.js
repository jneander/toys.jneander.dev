import React, {PureComponent} from 'react'
import {ScrollSync, ScrollSyncPane} from 'react-scroll-sync'

import GridContainer from './GridContainer'
import styles from './styles.css'

export default class Grid extends PureComponent {
  render() {
    return (
      <ScrollSync>
        <div className={styles.Grid}>
          <GridContainer {...this.props} columns={this.props.columns.slice(0, 1)} frozen />

          <GridContainer {...this.props} columns={this.props.columns.slice(1)} />
        </div>
      </ScrollSync>
    )
  }
}
