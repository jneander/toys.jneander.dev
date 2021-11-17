import {Chromosome} from '@jneander/genetics'
import {ReactNode} from 'react'

import styles from './styles.module.css'

interface ChromosomeRowProps<GeneType> {
  chromosome?: Chromosome<GeneType, any>
  formatGenes: (genes: GeneType[]) => ReactNode
  version: string
}

function ChromosomeRow<GeneType>(props: ChromosomeRowProps<GeneType>) {
  return (
    <tr>
      <th scope="row">{props.version}</th>

      <td style={{fontFamily: 'monospace'}}>
        {props.chromosome && props.formatGenes(props.chromosome.genes)}
      </td>

      <td style={{textAlign: 'right'}}>
        {props.chromosome?.fitness?.toString()}
      </td>

      <td style={{textAlign: 'right'}}>{props.chromosome?.iteration}</td>
    </tr>
  )
}

function defaultFormatGenes<GeneType = any>(genes: GeneType[]): ReactNode {
  return genes.join('')
}

interface ChromosomeTableProps<GeneType> {
  best: Chromosome<GeneType, any>
  current: Chromosome<GeneType, any>
  first: Chromosome<GeneType, any>
  formatGenes: (genes: GeneType[]) => ReactNode
  target: Chromosome<GeneType, any>
}

export default function ChromosomeTable<GeneType = any>(
  props: ChromosomeTableProps<GeneType>
) {
  const {formatGenes = defaultFormatGenes} = props

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
        <ChromosomeRow
          chromosome={props.first}
          formatGenes={formatGenes}
          version="First"
        />

        <ChromosomeRow
          chromosome={props.current}
          formatGenes={formatGenes}
          version="Current"
        />

        <ChromosomeRow
          chromosome={props.best}
          formatGenes={formatGenes}
          version="Best"
        />

        <ChromosomeRow
          chromosome={props.target}
          formatGenes={formatGenes}
          version="Target"
        />
      </tbody>
    </table>
  )
}
