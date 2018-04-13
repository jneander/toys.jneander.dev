import React, {PureComponent} from 'react'
import DataGrid from '@jneander/data-grid'

import HeaderCellComponentFactory from './HeaderCellComponentFactory'
import RowCellComponentFactory from './RowCellComponentFactory'
import styles from './styles.css'

import {keyedData} from './exampleData'

const headerCellFactory = new HeaderCellComponentFactory()
const rowCellFactory = new RowCellComponentFactory()

const headerHeight = 40
const rowHeight = 36
const rowClassNames = [styles['Row--even'], styles['Row--odd']]

export default class DataGridExampleX extends PureComponent {
  render() {
    return (
      <DataGrid
        className={styles.Grid}
        columns={keyedData.columns}
        rows={keyedData.rows}
        gridBodyClassName={styles.GridBody}
        gridHeaderClassName={styles.GridHeader}
        headerCellFactory={headerCellFactory}
        headerHeight={headerHeight}
        rowCellFactory={rowCellFactory}
        rowClassNames={rowClassNames}
        rowHeight={rowHeight}
        {...this.props}
      />
    )
  }
}
