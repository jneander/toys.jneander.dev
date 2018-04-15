import React, {Component} from 'react'

import styles from './styles.css'
import Row from './Row'

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

export default class Body extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.bindRowGroup = ref => {
      this.rowGroup = ref
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.activeLocation !== this.props.activeLocation
  }

  handleClick(event) {
    const location = getLocationFromEvent(event, this)
    this.props.onClick(event, location)
  }

  render() {
    const style = {
      top: `${this.props.headerHeight}px`
    }

    return (
      <div
        className={styles.Body}
        onClick={this.handleClick}
        ref={this.bindRowGroup}
        role="rowgroup"
        style={style}
      >
        {this.props.rows.map((row, index) => (
          <Row
            activeLocation={this.props.activeLocation}
            bindActiveElement={this.props.bindActiveElement}
            columns={this.props.columns}
            even={index % 2 === 0}
            height={this.props.rowHeight}
            key={row.id}
            renderCell={this.props.renderCell}
            row={row}
          />
        ))}
      </div>
    )
  }
}
