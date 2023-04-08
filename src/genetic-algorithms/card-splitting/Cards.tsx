import {Chromosome, product, PropagationRecord, sum} from '@jneander/genetics'

import {CardSplittingFitnessValue} from './types'

import styles from './styles.module.scss'

function convertGene(gene: string) {
  return gene === 'A' ? 1 : parseInt(gene, 10)
}

function geneSum(chromosome: Chromosome<string>) {
  return sum(chromosome.genes.slice(0, 5).map(convertGene))
}

function geneProduct(chromosome: Chromosome<string>) {
  return product(chromosome.genes.slice(5, 10).map(convertGene))
}

interface CardsProps {
  label: string
  record: PropagationRecord<string, CardSplittingFitnessValue>
}

export default function Cards(props: CardsProps) {
  const sumGenes = props.record.chromosome.genes.slice(0, 5)
  const productGenes = props.record.chromosome.genes.slice(5, 10)

  return (
    <div className={styles.View}>
      <h2 className={styles.CardsHeading}>{props.label}</h2>

      <div className={styles.CardSet__Top}>
        {sumGenes.map((card, index) => (
          <span key={index} className={styles.Card}>
            {card}
          </span>
        ))}

        <span className={styles.SetMetrics}>Sum: {geneSum(props.record.chromosome)}</span>
      </div>

      <div className={styles.CardSet__Bottom}>
        {productGenes.map((card, index) => (
          <span key={index} className={styles.Card}>
            {card}
          </span>
        ))}

        <span className={styles.SetMetrics}>Product: {geneProduct(props.record.chromosome)}</span>
      </div>
    </div>
  )
}
