import {product, sum} from '@jneander/genetics'

import styles from './styles.module.css'

function convertGene(gene) {
  return gene === 'A' ? 1 : parseInt(gene, 10)
}

function geneSum(chromosome) {
  return sum(chromosome.genes.slice(0, 5).map(convertGene))
}

function geneProduct(chromosome) {
  return product(chromosome.genes.slice(5, 10).map(convertGene))
}

export default function Cards(props) {
  const sumGenes = props.chromosome.genes.slice(0, 5)
  const productGenes = props.chromosome.genes.slice(5, 10)

  return (
    <div className={styles.View}>
      <h2 className={styles.CardsHeading}>{props.label}</h2>

      <div className={styles.CardSet__Top}>
        {sumGenes.map((card, index) => (
          <span key={index} className={styles.Card}>
            {card}
          </span>
        ))}

        <span className={styles.SetMetrics}>
          Sum: {geneSum(props.chromosome)}
        </span>
      </div>

      <div className={styles.CardSet__Bottom}>
        {productGenes.map((card, index) => (
          <span key={index} className={styles.Card}>
            {card}
          </span>
        ))}

        <span className={styles.SetMetrics}>
          Product: {geneProduct(props.chromosome)}
        </span>
      </div>
    </div>
  )
}
