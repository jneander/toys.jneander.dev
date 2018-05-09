import React, {PureComponent} from 'react'
import FormFieldGroup from '@instructure/ui-forms/lib/components/FormFieldGroup'
import Heading from '@instructure/ui-elements/lib/components/Heading'
import NumberInput from '@instructure/ui-forms/lib/components/NumberInput'
import View from '@instructure/ui-layout/lib/components/View'

import Layout from '../../shared/components/Layout'
import NotesCell from './cells/NotesCell'
import StudentCell from './cells/StudentCell'
import TextCell from './cells/TextCell'
import NotesColumnHeader from './headers/NotesColumnHeader'
import StudentColumnHeader from './headers/StudentColumnHeader'
import TextColumnHeader from './headers/TextColumnHeader'
import DataGrid, {Cell, ColumnHeader} from './DataGrid'
import createGridData from './createGridData'
import styles from './styles.css'

function createGridDataFromState(state) {
  return createGridData({
    columnCount: state.columnCount,
    rowCount: state.rowCount
  })
}

export default class DataGridV4 extends PureComponent {
  constructor(props) {
    super(props)

    this.handleColumnCountChange = (event, number) => {
      const nextState = {...this.state, columnCount: parseInt(number)}
      this.setState({
        ...nextState,
        ...createGridDataFromState(nextState)
      })
    }

    this.handleFreezeColumnsStartChange = (event, number) => {
      this.setState({freezeColumnsStart: parseInt(number)})
    }

    this.handleFreezeColumnsEndChange = (event, number) => {
      this.setState({freezeColumnsEnd: parseInt(number)})
    }

    this.handleRowCountChange = (event, number) => {
      this.setState({rowCount: parseInt(number)})
    }

    const initialState = {
      columnCount: 10,
      freezeColumnsEnd: 0,
      freezeColumnsStart: 2,
      headerHeight: 40,
      rowCount: 50,
      rowHeight: 36
    }

    this.state = {
      ...initialState,
      ...createGridDataFromState(initialState)
    }
  }

  render() {
    return (
      <Layout>
        <div className={styles.Root}>
          <Heading level="h2">DataGrid v4</Heading>

          <View as="div" margin="medium 0">
            <FormFieldGroup colSpacing="medium" description="Columns" layout="columns" vAlign="top">
              <NumberInput
                label="Number of Columns"
                max="10"
                min="5"
                onChange={this.handleColumnCountChange}
                value={this.state.columnCount}
              />

              <NumberInput
                label="Freeze Columns Start"
                max="2"
                min="0"
                onChange={this.handleFreezeColumnsStartChange}
                value={this.state.freezeColumnsStart}
              />

              <NumberInput
                label="Freeze Columns End"
                max="2"
                min="0"
                onChange={this.handleFreezeColumnsEndChange}
                value={this.state.freezeColumnsEnd}
              />
            </FormFieldGroup>
          </View>

          <div className={styles.Grid}>
            <DataGrid
              columns={this.state.columns}
              freezeColumnsEnd={this.state.freezeColumnsEnd}
              freezeColumnsStart={this.state.freezeColumnsStart}
              freezeHeader
              freezeRowsBottom={0}
              freezeRowsTop={0}
              headerHeight={40}
              navigableHeaders
              renderCell={props => {
                if (props.column.id === 'studentName') {
                  return (
                    <Cell>
                      <StudentCell {...props} />
                    </Cell>
                  )
                }
                if (props.column.id === 'notes') {
                  return (
                    <Cell>
                      <NotesCell {...props} />
                    </Cell>
                  )
                }
                return (
                  <Cell>
                    <TextCell {...props} />
                  </Cell>
                )
              }}
              renderColumnHeader={props => {
                if (props.column.id === 'studentName') {
                  return (
                    <ColumnHeader>
                      <StudentColumnHeader {...props} />
                    </ColumnHeader>
                  )
                }
                if (props.column.id === 'notes') {
                  return (
                    <ColumnHeader>
                      <NotesColumnHeader {...props} />
                    </ColumnHeader>
                  )
                }
                return (
                  <ColumnHeader>
                    <TextColumnHeader {...props} />
                  </ColumnHeader>
                )
              }}
              rowHeight={36}
              rows={this.state.rows}
            />
          </div>
        </div>
      </Layout>
    )
  }
}
