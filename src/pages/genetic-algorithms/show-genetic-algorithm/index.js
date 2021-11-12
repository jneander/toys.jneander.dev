import {useState} from 'react'

import {
  CardSplitting,
  KnightCovering,
  OneMax,
  Queens,
  SortingNumbers,
  TextMatching
} from '../../../genetic-algorithms'
import Layout from '../../../shared/components/Layout'

import styles from './styles.module.css'

const examples = [
  {label: 'Text Matching', component: TextMatching},
  {label: 'One Max', component: OneMax},
  {label: 'Sorting Numbers', component: SortingNumbers},
  {label: 'Queens', component: Queens},
  {label: 'Card Splitting', component: CardSplitting},
  {label: 'Knight Covering', component: KnightCovering}
]

export function ShowGeneticAlgorithm() {
  const [selectedExample, setSelectedExample] = useState(examples[0])

  const Component = selectedExample.component

  function handleExampleChange(event) {
    setSelectedExample(
      examples.find(example => example.label === event.target.value)
    )
  }

  return (
    <Layout page="geneticAlgorithms">
      <div className={styles.Container}>
        <header className={styles.Header}>
          <h1>Genetic Algorithms</h1>
        </header>

        <span>
          <label
            className={styles.ExampleSelectLabel}
            htmlFor="selected-example"
          >
            Selected Example
          </label>

          <select
            id="selected-example"
            onChange={handleExampleChange}
            value={selectedExample.label}
          >
            {examples.map(example => (
              <option key={example.label} value={example.label}>
                {example.label}
              </option>
            ))}
          </select>
        </span>

        <div>
          <Component />
        </div>
      </div>
    </Layout>
  )
}
