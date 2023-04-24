import type {Chromosome, PropagationRecord} from '@jneander/genetics'
import {html} from 'lit'

import {product, sum} from '../../shared/utils'
import {BaseElement, defineElement} from '../../shared/views'
import type {CardSplittingFitnessValue} from './types'

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

export class CardsGroup extends BaseElement {
  private declare label: string
  private declare record: PropagationRecord<string, CardSplittingFitnessValue>

  static get properties() {
    return {
      label: {type: String},
      record: {type: Object},
    }
  }

  protected render() {
    const sumGenes = this.record.chromosome.genes.slice(0, 5)
    const productGenes = this.record.chromosome.genes.slice(5, 10)

    return html`
      <h2>${this.label}</h2>

      <div>
        ${sumGenes.map(card => html`<span class=${styles.Card}>${card}</span>`)}

        <span class=${styles.SetMetrics}>Sum: ${geneSum(this.record.chromosome)}</span>
      </div>

      <div>
        ${productGenes.map(card => html`<span class=${styles.Card}>${card}</span>`)}

        <span class=${styles.SetMetrics}>Product: ${geneProduct(this.record.chromosome)}</span>
      </div>
    `
  }
}

defineElement('cards-group', CardsGroup)
