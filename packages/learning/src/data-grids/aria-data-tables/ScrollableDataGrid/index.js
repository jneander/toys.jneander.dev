import React, {Component} from 'react'

import TextCell from '../shared/TextCell'
import TextColumnHeader from '../shared/TextColumnHeader'
import DescriptionCell from '../shared/DescriptionCell'
import DataTable from '../shared/DataTable'
import KeyCodes from '../shared/KeyCodes'
import rows from './data'
import styles from './styles.css'

const COLUMNS = [
  {id: 'date', name: 'Date'},
  {id: 'type', name: 'Type'},
  {id: 'description', name: 'Description'},
  {id: 'category', name: 'Category'},
  {id: 'amount', name: 'Amount'},
  {id: 'balance', name: 'Balance'}
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

        <DataTable
          aria-labelledby="grid3Label"
          columns={columns}
          perPage={this.props.perPage}
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
