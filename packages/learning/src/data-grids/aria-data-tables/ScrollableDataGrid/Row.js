import React, {Component} from 'react'

import styles from './styles.css'

export default class Row extends Component {
  render() {
    const {activeLocation, bindActiveElement, row, typeAndCategoryHidden} = this.props
    const typeAndCategoryClasses = [styles.GridCell]
    if (typeAndCategoryHidden) {
      typeAndCategoryClasses.push(styles.Hidden)
    }

    const rowIsActive = activeLocation.rowId === row.id
    const isActiveLocation = columnId => rowIsActive && columnId === activeLocation.columnId
    const tabIndexFor = columnId => (isActiveLocation(columnId) ? '0' : '-1')
    const refFor = columnId => (isActiveLocation(columnId) ? bindActiveElement : undefined)

    return (
      <tr className={this.props.className}>
        <td className={styles.GridCell} ref={refFor('date')} tabIndex={tabIndexFor('date')}>
          {row.date}
        </td>
        <td
          className={typeAndCategoryClasses.join(' ')}
          ref={refFor('type')}
          tabIndex={tabIndexFor('type')}
        >
          {row.type}
        </td>
        <td className={styles.GridCell}>
          <a href="#" ref={refFor('description')} tabIndex={tabIndexFor('description')}>
            {row.description}
          </a>
        </td>
        <td
          className={typeAndCategoryClasses.join(' ')}
          ref={refFor('category')}
          tabIndex={tabIndexFor('category')}
        >
          {row.category}
        </td>
        <td className={styles.GridCell} ref={refFor('amount')} tabIndex={tabIndexFor('amount')}>
          {row.amount}
        </td>
        <td className={styles.GridCell} ref={refFor('balance')} tabIndex={tabIndexFor('balance')}>
          {row.balance}
        </td>
      </tr>
    )
  }
}
