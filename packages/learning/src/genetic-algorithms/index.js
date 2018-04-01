import React, {Component} from 'react'
import Container from '@instructure/ui-core/lib/components/Container'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Select from '@instructure/ui-core/lib/components/Select'

import Layout from '../shared/components/Layout'
import CardSplitting from './CardSplitting'
import KnightCovering from './KnightCovering'
import OneMax from './OneMax'
import Queens from './Queens'
import SortingNumbers from './SortingNumbers'
import TextMatching from './TextMatching'

const examples = [
  {label: 'Text Matching', component: TextMatching},
  {label: 'One Max', component: OneMax},
  {label: 'Sorting Numbers', component: SortingNumbers},
  {label: 'Queens', component: Queens},
  {label: 'Card Splitting', component: CardSplitting},
  {label: 'Knight Covering', component: KnightCovering}
]

export default class GeneticAlgorithms extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedExample: examples[0]
    }
  }

  onExampleChange = event => {
    this.setState({
      selectedExample: examples.find(example => example.label === event.target.value)
    })
  }

  render() {
    const Example = this.state.selectedExample

    return (
      <Layout page="geneticAlgorithms">
        <Container as="header" margin="medium medium 0 medium">
          <Heading level="h2">Genetic Algorithms</Heading>
        </Container>

        <Container as="div" padding="medium medium 0 medium">
          <Select
            inline
            label="Examples"
            layout="inline"
            onChange={this.onExampleChange}
            value={this.state.selectedExample.label}
            width="auto"
          >
            {examples.map(example => (
              <option key={example.label} value={example.label}>
                {example.label}
              </option>
            ))}
          </Select>
        </Container>

        <Container as="div" padding="medium">
          <Example.component />
        </Container>
      </Layout>
    )
  }
}
