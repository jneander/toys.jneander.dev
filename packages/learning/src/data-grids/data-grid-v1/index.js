import React, {PureComponent} from 'react'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import View from '@instructure/ui-layout/lib/components/View'

import Layout from '../../shared/components/Layout'
import students from '../shared-data-grid/students'
import GradeCell from './cells/GradeCell'
import NotesCell from './cells/NotesCell'
import StudentCell from './cells/StudentCell'
import TextCell from './cells/TextCell'
import TextColumnHeader from './headers/TextColumnHeader'
import columns from './columns'
import DataGrid from './DataGrid'

export default class DataGridV1 extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      columns: [...columns],
      rows: [...students]
    }
  }

  render() {
    return (
      <Layout>
        <View margin="medium" display="block">
          <View as="header" margin="0 0 medium 0">
            <Heading level="h2">Data Grid v1</Heading>
          </View>

          <View as="div" margin="medium 0 0 0">
            <Heading level="h3">Example 1: Minimal Data Grid</Heading>

            <View as="div" margin="medium 0 0 0">
              <DataGrid
                columns={this.state.columns}
                navigableHeaders
                renderColumnHeader={props => <TextColumnHeader {...props} />}
                renderCell={props => {
                  if (props.column.id === 'name') {
                    return <StudentCell {...props} />
                  }
                  return <TextCell {...props} />
                }}
                rows={this.state.rows}
                rowsPerPage={10}
              />
            </View>
          </View>

          <View as="div" margin="medium 0 0 0">
            <Heading level="h3">Example 2: Data Grid with Widgets</Heading>

            <View as="div" margin="medium 0 0 0">
              <DataGrid
                columns={this.state.columns}
                navigableHeaders
                renderColumnHeader={props => <TextColumnHeader {...props} />}
                renderCell={props => {
                  if (props.column.id === 'name') {
                    return <StudentCell {...props} />
                  }
                  if (props.column.id === 'notes') {
                    return <NotesCell {...props} />
                  }
                  if (props.column.id === 'grade') {
                    return <GradeCell {...props} />
                  }
                  return <TextCell {...props} />
                }}
                rows={this.state.rows}
                rowsPerPage={10}
              />
            </View>
          </View>
        </View>
      </Layout>
    )
  }
}
