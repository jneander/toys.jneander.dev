import React, {Component} from 'react'

import KeyCodes from '../shared/KeyCodes'
import DataTable from '../shared/DataTable'
import Column from '../shared/DataTable/Column'
import DescriptionColumn from './DescriptionColumn'
import rows from './data'
import styles from './styles.css'

const COLUMNS = [
  new Column({id: 'date', name: 'Date'}),
  new Column({id: 'type', name: 'Type'}),
  new DescriptionColumn({id: 'description', name: 'Description'}),
  new Column({id: 'category', name: 'Category'}),
  new Column({id: 'amount', name: 'Amount'}),
  new Column({id: 'balance', name: 'Balance'})
]

export default class ScrollableDataGrid extends Component {
  static defaultProps = {
    perPage: 5
  }

  constructor(props) {
    super(props)

    this.toggleTypeAndCategoryColumns = this.toggleTypeAndCategoryColumns.bind(this)

    this.state = {
      typeAndCategoryHidden: false
    }
  }

  toggleTypeAndCategoryColumns() {
    this.setState({typeAndCategoryHidden: !this.state.typeAndCategoryHidden})
  }

  render() {
    let columns = [...COLUMNS]
    if (this.state.typeAndCategoryHidden) {
      columns = [0, 2, 4, 5].map(index => columns[index])
    }

    return (
      <div className={styles.ExampleContainer}>
        <h4 className={styles.Heading} id="grid3Label">
          Transactions for January 1 through January 15
        </h4>

        <button onClick={this.toggleTypeAndCategoryColumns} type="button">
          {this.state.typeAndCategoryHidden ? 'Show Type and Category' : 'Hide Type and Category'}
        </button>

        <DataTable columns={columns} perPage={this.props.perPage} rows={rows} />
      </div>
    )
  }
}
