import React, {Component} from 'react'

import DescriptionColumn from '../shared/DescriptionColumn'
import DataTable from '../shared/DataTable'
import Column from '../shared/DataTable/Column'
import rows from './data'
import styles from './styles.css'

const COLUMNS = [
  new Column({id: 'date', name: 'Date'}),
  new Column({id: 'type', name: 'Type'}),
  new DescriptionColumn({id: 'description', name: 'Description'}),
  new Column({id: 'amount', name: 'Amount'}),
  new Column({id: 'balance', name: 'Balance'})
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
          rows={rows}
        />
      </div>
    )
  }
}
