import React, {Component} from 'react'

import TextCell from '../shared/TextCell'
import TextColumnHeader from '../shared/TextColumnHeader'
import DescriptionCell from '../shared/DescriptionCell'
import DataTable from '../shared/DataTable'
import rows from './data'
import styles from './styles.css'

const COLUMNS = [
  {id: 'date', name: 'Date'},
  {id: 'type', name: 'Type'},
  {id: 'description', name: 'Description'},
  {id: 'amount', name: 'Amount'},
  {id: 'balance', name: 'Balance'}
]

export default class MinimalDataGrid extends Component {
  render() {
    return (
      <div className={styles.ExampleContainer}>
        <h4 className={styles.Heading} id="grid1Label">
          Transactions January 1 through January 6
        </h4>

        <DataTable
          aria-labelledby="grid1Label"
          columns={COLUMNS}
          perPage={rows.length}
          renderColumnHeader={props => <TextColumnHeader {...props} />}
          renderCell={props => {
            if (props.column.id === 'description') {
              return <DescriptionCell {...props} />
            }
            return <TextCell {...props} />
          }}
          rows={rows}
        />
      </div>
    )
  }
}
