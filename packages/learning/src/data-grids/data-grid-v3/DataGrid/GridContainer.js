import React, {PureComponent} from 'react'
import {ScrollSyncPane} from 'react-scroll-sync'

import Body from './Body'
import Header from './Header'
import styles from './styles.css'
function getLocationFromEvent(event, self) {
  const rows = self.rowGroup.children
  let rowIndex = [].findIndex.call(rows, row => row.contains(event.target))
  if (rowIndex !== -1) {
    let columnIndex = [].findIndex.call(rows[rowIndex].children, cell =>
      cell.contains(event.target)
    )
    if (columnIndex !== -1) {
      return {
        columnId: self.props.columns[columnIndex].id,
        region: 'body',
        rowId: self.props.rows[rowIndex].id
      }
    }
  }
  return {}
}

export default class GridContainer extends PureComponent {
  render() {
    return (
      <div className={this.props.frozen ? styles.GridContainerFrozen : styles.GridContainer}>
        <ScrollSyncPane>
          <Header
            activeLocation={this.props.activeLocation}
            bindActiveElement={this.props.bindActiveElement}
            columns={this.props.columns}
            height={this.props.headerHeight}
            onClick={this.props.onClick}
            renderColumnHeader={this.props.renderColumnHeader}
          />
        </ScrollSyncPane>

        <ScrollSyncPane>
          <Body
            activeLocation={this.props.activeLocation}
            bindActiveElement={this.props.bindActiveElement}
            columns={this.props.columns}
            headerHeight={this.props.headerHeight}
            onClick={this.props.onClick}
            renderCell={this.props.renderCell}
            rowHeight={this.props.rowHeight}
            rows={this.props.rows}
          />
        </ScrollSyncPane>
      </div>
    )
  }
}
