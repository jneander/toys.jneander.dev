import React from 'react'
import PropTypes from 'prop-types'

import KeyCodes from 'js/apps/wai-data-grid/shared/KeyCodes'

import styles from './css/styles.css'

export default class ColumnHeader extends React.PureComponent {
  static defaultProps = {
    sortable: false,
    sortDirection: 'none'
  }

  static propTypes = {
    children: PropTypes.node.isRequired,
    sortable: PropTypes.bool,
    sortDirection: PropTypes.oneOf(['none', 'ascending', 'descending'])
  }

  bindFocusable = ref => {
    this.focusable = ref
  }

  focus = () => {
    this.focusable.focus()
  }

  handleClick = event => {
    this.toggleSort()
  }

  handleKeyDown = event => {
    if (event.which === 13 || event.which === 32) {
      this.toggleSort()
    }
  }

  toggleSort = () => {
    this.props.onSort(this.props.sortDirection === 'ascending' ? 'descending' : 'ascending')
  }

  render() {
    if (this.props.sortable) {
      const classes = [styles.ColumnHeader]
      if (this.props.sortDirection === 'ascending') {
        classes.push(styles.SortAscending)
      } else if (this.props.sortDirection === 'descending') {
        classes.push(styles.SortDescending)
      }

      return (
        <th className={classes.join(' ')} aria-sort={this.props.sortDirection}>
          <span
            ref={this.bindFocusable}
            onClick={this.handleClick}
            onKeyDown={this.handleKeyDown}
            role="button"
            tabIndex={this.props.isActive ? '0' : '-1'}
          >
            {this.props.children}
          </span>
        </th>
      )
    }

    return (
      <th ref={this.bindFocusable} className={styles.ColumnHeader} tabIndex={this.props.isActive ? '0' : '-1'}>
        {this.props.children}
      </th>
    )
  }
}
