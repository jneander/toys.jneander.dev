import React, {PureComponent} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import TabList, {TabPanel} from '@instructure/ui-tabs/lib/components/TabList'
import Text from '@instructure/ui-elements/lib/components/Text'

import Layout from '../../shared/components/Layout'
import StudentCell from './cells/StudentCell'
import TextCell from './cells/TextCell'
import StudentColumnHeader from './headers/StudentColumnHeader'
import TextColumnHeader from './headers/TextColumnHeader'
import {columns, rows} from './data'
import DataGrid from './DataGrid'
import styles from './styles.css'

export default class DataGridV3 extends PureComponent {
  render() {
    return (
      <Layout>
        <div className={styles.Root}>
          <Heading level="h2" margin="0 0 medium 0">
            DataGrid v3
          </Heading>

          <Heading level="h3" margin="0 0 medium 0">
            Example 1: Minimal Data Grid
          </Heading>

          <div className={styles.Grid}>
            <DataGrid
              columns={columns}
              headerHeight={36}
              navigableHeaders
              renderCell={props => {
                if (props.column.id === 'studentName') {
                  return <StudentCell {...props} />
                }
                return <TextCell {...props} />
              }}
              renderColumnHeader={props => {
                if (props.column.id === 'studentName') {
                  return <StudentColumnHeader {...props} />
                }
                return <TextColumnHeader {...props} />
              }}
              rowHeight={32}
              rows={rows}
            />
          </div>
        </div>
      </Layout>
    )
  }
}
