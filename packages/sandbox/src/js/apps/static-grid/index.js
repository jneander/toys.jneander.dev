import React from 'react'

import ExampleHarness from 'js/shared/components/ExampleHarness'

import Example01 from './Example01'
import Example02 from './Example02'

const examples = [
  {label: 'No Row Headers', component: Example01},
  {label: 'With Row Headers', component: Example02}
]

export default function StaticGridExamples(props) {
  return <ExampleHarness examples={examples} heading="Static Grid" />
}
