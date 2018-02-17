import React from 'react'

import AppHarness from '../../shared/components/AppHarness'
import ExampleHarness from '../shared/components/ExampleHarness'
import TableWithoutRowHeaders from './TableWithoutRowHeaders'
import TableWithRowHeaders from './TableWithRowHeaders'

const examples = [
  {label: 'Table without Row Headers', component: TableWithoutRowHeaders},
  {label: 'Table with Row Headers', component: TableWithRowHeaders}
]

export default function StaticGridExamples(props) {
  return (
    <AppHarness page="staticGrid">
      <ExampleHarness examples={examples} heading="Static Grid" />
    </AppHarness>
  )
}
