import React, {PureComponent} from 'react'
import Container from '@instructure/ui-container/lib/components/Container'
import Heading from '@instructure/ui-elements/lib/components/Heading'

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
        <Container margin="medium" display="block">
          <Container as="header" margin="0 0 medium 0">
            <Heading level="h2">Data Grid v1</Heading>
          </Container>

          <Container as="div" margin="medium 0 0 0">
            <Heading level="h3">Example 1: Minimal Data Grid</Heading>

            <Container as="div" margin="medium 0 0 0">
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
            </Container>
          </Container>

          <Container as="div" margin="medium 0 0 0">
            <Heading level="h3">Example 2: Data Grid with Widgets</Heading>

            <Container as="div" margin="medium 0 0 0">
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
            </Container>
          </Container>
        </Container>
      </Layout>
    )
  }
}
