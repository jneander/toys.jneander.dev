import {PropagationRecord} from '@jneander/genetics'
import {ReactNode} from 'react'

import styles from './styles.module.css'

interface RecordRowProps<GeneType, FitnessValueType> {
  record: PropagationRecord<GeneType, FitnessValueType> | null
  formatFitness: (fitness: FitnessValueType) => ReactNode
  formatGenes: (genes: GeneType[]) => ReactNode
  version: string
}

function RecordRow<GeneType, FitnessValueType>(
  props: RecordRowProps<GeneType, FitnessValueType>
) {
  const {record, formatFitness, formatGenes, version} = props

  return (
    <tr>
      <th scope="row">{version}</th>

      <td style={{fontFamily: 'monospace'}}>
        {record?.chromosome && formatGenes(record.chromosome.genes)}
      </td>

      <td style={{textAlign: 'right'}}>
        {record && formatFitness(record.fitness.value)}
      </td>

      <td style={{textAlign: 'right'}}>
        {record?.iteration! >= 0 && record?.iteration}
      </td>
    </tr>
  )
}

function defaultFormatFitness<FitnessValueType = any>(
  fitness: FitnessValueType
): ReactNode {
  return String(fitness)
}

function defaultFormatGenes<GeneType = any>(genes: GeneType[]): ReactNode {
  return genes.join('')
}

interface ChromosomeTableProps<GeneType, FitnessValueType> {
  best: PropagationRecord<GeneType, any> | null
  current: PropagationRecord<GeneType, any> | null
  first: PropagationRecord<GeneType, any> | null
  formatFitness?: (fitness: FitnessValueType) => ReactNode
  formatGenes?: (genes: GeneType[]) => ReactNode
  target: PropagationRecord<GeneType, any>
}

export default function ChromosomeTable<GeneType = any, FitnessValueType = any>(
  props: ChromosomeTableProps<GeneType, FitnessValueType>
) {
  const {formatGenes = defaultFormatGenes} = props
  const {formatFitness = defaultFormatFitness} = props

  return (
    <table className={styles.ChromosomeTable}>
      <caption className={styles.ChromosomeTableCaption}>
        <h3>Chromosomes</h3>
      </caption>

      <thead>
        <tr>
          <th>Version</th>
          <th>Genes</th>
          <th>Fitness</th>
          <th>Iteration</th>
        </tr>
      </thead>

      <tbody>
        <RecordRow
          formatFitness={formatFitness}
          formatGenes={formatGenes}
          record={props.first}
          version="First"
        />

        <RecordRow
          formatFitness={formatFitness}
          formatGenes={formatGenes}
          record={props.current}
          version="Current"
        />

        <RecordRow
          formatFitness={formatFitness}
          formatGenes={formatGenes}
          record={props.best}
          version="Best"
        />

        <RecordRow
          formatFitness={formatFitness}
          formatGenes={formatGenes}
          record={props.target}
          version="Target"
        />
      </tbody>
    </table>
  )
}
