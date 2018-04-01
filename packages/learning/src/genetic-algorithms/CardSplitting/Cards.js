import React, {PureComponent} from 'react'
import Heading from '@instructure/ui-core/lib/components/Heading'

import {product, sum} from '@jneander/genetics/es/util'

import styles from './styles.css'

function convertGene(gene) {
  return gene === 'A' ? 1 : parseInt(gene, 10)
}

function geneSum(chromosome) {
  return sum(chromosome.genes.slice(0, 5).map(convertGene))
}

function geneProduct(chromosome) {
  return product(chromosome.genes.slice(5, 10).map(convertGene))
}

export default class Cards extends PureComponent {
  render() {
    const sumGenes = this.props.chromosome.genes.slice(0, 5)
    const productGenes = this.props.chromosome.genes.slice(5, 10)

    return (
      <div className={styles.Container}>
        <Heading level="h3" margin="0 0 small 0">
          {this.props.label}
        </Heading>

        <div className={styles.CardSet__Top}>
          {sumGenes.map((card, index) => (
            <span key={index} className={styles.Card}>
              {card}
            </span>
          ))}

          <span className={styles.SetMetrics}>Sum: {geneSum(this.props.chromosome)}</span>
        </div>

        <div className={styles.CardSet__Bottom}>
          {productGenes.map((card, index) => (
            <span key={index} className={styles.Card}>
              {card}
            </span>
          ))}

          <span className={styles.SetMetrics}>Product: {geneProduct(this.props.chromosome)}</span>
        </div>
      </div>
    )
  }
}
