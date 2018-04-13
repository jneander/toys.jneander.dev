import React, {Component} from 'react'

import KeyCodes from '../shared/KeyCodes'
import styles from '../shared/DataTable/styles.css'
import sortableStyles from './css/styles.css'

export default class AmountColumnHeader extends Component {
  constructor(props) {
    super(props)

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleToggleSort = this.handleToggleSort.bind(this)
  }

  handleKeyDown(event) {
    const key = event.which || event.keyCode
    if (key === KeyCodes.ENTER || key === KeyCodes.SPACE) {
      event.preventDefault()
      this.handleToggleSort()
    }
  }

  handleToggleSort() {
    this.props.onSort(
      'amount',
      this.props.sortDirection === 'ascending' ? 'descending' : 'ascending'
    )
  }

  render() {
    const classes = [styles.ColumnHeader]
    if (this.props.sortColumn === 'amount') {
      if (this.props.sortDirection === 'ascending') {
        classes.push(sortableStyles.SortAscending)
      } else if (this.props.sortDirection === 'descending') {
        classes.push(sortableStyles.SortDescending)
      }
    }

    return (
      <th aria-sort={this.props.sortDirection} className={classes.join(' ')}>
        <span
          onClick={this.handleToggleSort}
          onKeyDown={this.handleKeyDown}
          ref={this.props.focusableRef}
          role="button"
          tabIndex={this.props.tabIndex}
        >
          {this.props.column.name}
        </span>
      </th>
    )
  }
}
