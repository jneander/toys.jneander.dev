import React, {PureComponent} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import Link from '@instructure/ui-elements/lib/components/Link'
import TabList, {TabPanel} from '@instructure/ui-tabs/lib/components/TabList'
import Text from '@instructure/ui-elements/lib/components/Text'

import Layout from '../../shared/components/Layout'
import StudentCell from './cells/StudentCell'
import TextCell from './cells/TextCell'
import TextColumnHeader from './headers/TextColumnHeader'
import {columns, rows} from './data'
import DataGrid from './DataGrid'
import styles from './styles.css'

export default class DataGridV3 extends PureComponent {
  render() {
    return (
      <Layout>
        <Container margin="medium" display="block">
          <Container as="header" margin="0 0 medium 0">
            <Heading level="h2">DataGrid v3</Heading>
          </Container>

          <Container as="div" margin="medium 0 0 0">
            <Heading level="h3">Example 1: Minimal Data Grid</Heading>

            <Container as="div" margin="medium 0 0 0">
              <div
                className={styles.Grid}
                style={{width: '600px', height: '400px', position: 'relative'}}
              >
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
                  renderColumnHeader={props => <TextColumnHeader {...props} />}
                  rowHeight={32}
                  rows={rows}
                />
              </div>
            </Container>
          </Container>
        </Container>
      </Layout>
    )
  }
}
