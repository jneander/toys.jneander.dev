import React, {Component} from 'react'

import TextCell from '../shared/TextCell'
import TextColumnHeader from '../shared/TextColumnHeader'
import DataTable from '../shared/DataTable'
import AmountColumnHeader from './AmountColumnHeader'
import CategoryCell from './CategoryCell'
import DateColumnHeader from './DateColumnHeader'
import DescriptionCell from './DescriptionCell'
import rows from './data'
import styles from './css/styles.css'

const COLUMNS = [
  {id: 'date', name: 'Date'},
  {id: 'type', name: 'Type'},
  {id: 'description', name: 'Description'},
  {id: 'category', name: 'Category'},
  {id: 'amount', name: 'Amount'},
  {id: 'balance', name: 'Balance'}
]

export default class SortableDataGrid extends Component {
  constructor(props) {
    super(props)

    this.handleSort = this.handleSort.bind(this)

    this.state = {
      rows: [...rows],
      sortColumn: 'date',
      sortDirection: 'ascending'
    }
  }

  handleSort(sortColumn, sortDirection) {
    const rows = [...this.state.rows].sort((a, b) => {
      let valueA = a[sortColumn]
      let valueB = b[sortColumn]
      if (sortDirection === 'descending') {
        ;[valueA, valueB] = [valueB, valueA]
      }
      if (valueA === valueB) {
        return 0
      }
      return valueA > valueB ? 1 : -1
    })
    this.setState({rows, sortColumn, sortDirection})
  }

  render() {
    return (
      <div className={styles.ExampleContainer}>
        <h4 className={styles.Heading} id="grid2Label">
          Transactions January 1 through January 7
        </h4>

        <DataTable
          aria-labelledby="grid1Label"
          columns={COLUMNS}
          navigableHeaders
          perPage={this.state.rows.length}
          renderColumnHeader={props => {
            if (props.column.id === 'date') {
              return (
                <DateColumnHeader
                  {...props}
                  onSort={this.handleSort}
                  sortColumn={this.state.sortColumn}
                  sortDirection={this.state.sortDirection}
                />
              )
            }
            if (props.column.id === 'amount') {
              return (
                <AmountColumnHeader
                  {...props}
                  onSort={this.handleSort}
                  sortColumn={this.state.sortColumn}
                  sortDirection={this.state.sortDirection}
                />
              )
            }
            return <TextColumnHeader {...props} />
          }}
          renderCell={props => {
            if (props.column.id === 'description') {
              return <DescriptionCell {...props} />
            }
            if (props.column.id === 'category') {
              return <CategoryCell {...props} />
            }
            return <TextCell {...props} />
          }}
          rows={this.state.rows}
        />
      </div>
    )
  }
}
