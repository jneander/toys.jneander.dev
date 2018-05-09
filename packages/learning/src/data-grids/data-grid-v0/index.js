import React, {PureComponent} from 'react'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import View from '@instructure/ui-layout/lib/components/View'

import Layout from '../../shared/components/Layout'
import HeaderCellComponentFactory from './components/HeaderCellComponentFactory'
import RowCellComponentFactory from './components/RowCellComponentFactory'
import DataGrid from './DataGrid'
import {columns, rows} from './exampleData'
import styles from './styles.css'

const headerCellFactory = new HeaderCellComponentFactory()
const rowCellFactory = new RowCellComponentFactory()

const headerHeight = 40
const rowHeight = 36
const rowClassNames = [styles['Row--even'], styles['Row--odd']]

export default class DataGridV0 extends PureComponent {
  render() {
    return (
      <Layout>
        <View margin="medium" display="block">
          <View as="header" margin="0 0 medium 0">
            <Heading level="h2">Data Grid v0</Heading>
          </View>

          <View as="div" margin="medium 0 0 0">
            <DataGrid
              className={styles.Grid}
              columns={columns}
              gridBodyClassName={styles.GridBody}
              gridHeaderClassName={styles.GridHeader}
              headerCellFactory={headerCellFactory}
              headerHeight={headerHeight}
              rowCellFactory={rowCellFactory}
              rowClassNames={rowClassNames}
              rowHeight={rowHeight}
              rows={rows}
            />
          </View>
        </View>
      </Layout>
    )
  }
}
