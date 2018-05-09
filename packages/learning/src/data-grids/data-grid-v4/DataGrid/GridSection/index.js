import React, {PureComponent} from 'react'

import ScrollSyncPane from '../utils/ScrollSyncPane'
import Body from '../Body'
import Header from '../Header'
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

export default class GridSection extends PureComponent {
  render() {
    const columnsWidth = this.props.columns.reduce((sum, column) => sum + column.width, 0)
    const bordersWidth = this.props.columns.length - 1

    const style = {
      flexBasis: `${columnsWidth - bordersWidth}px`,
      flexGrow: 0
    }

    let className = styles.GridSection
    if (this.props.frozenStart) {
      className = styles.GridSectionFrozenStart
    }
    if (this.props.frozenEnd) {
      className = styles.GridSectionFrozenEnd
    }

    return (
      <div className={className} role="grid" style={style}>
        <ScrollSyncPane columns={!(this.props.frozenStart || this.props.frozenEnd)}>
          <Header
            activeLocation={this.props.activeLocation}
            bindActiveElement={this.props.bindActiveElement}
            columns={this.props.columns}
            height={this.props.headerHeight}
            isInFirstSection={this.props.isFirstSection}
            isInLastSection={this.props.isLastSection}
            onClick={this.props.onClick}
            renderColumnHeader={this.props.renderColumnHeader}
          />
        </ScrollSyncPane>

        <ScrollSyncPane columns={!(this.props.frozenStart || this.props.frozenEnd)} rows>
          <Body
            activeLocation={this.props.activeLocation}
            bindActiveElement={this.props.bindActiveElement}
            columns={this.props.columns}
            headerHeight={this.props.headerHeight}
            isInFirstSection={this.props.isFirstSection}
            isInLastSection={this.props.isLastSection}
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
