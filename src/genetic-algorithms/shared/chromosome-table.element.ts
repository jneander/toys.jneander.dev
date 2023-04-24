import type {PropagationRecord} from '@jneander/genetics'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../shared/views'
import type {PropagationTarget} from './types'

import styles from './styles.module.scss'

interface RecordRowOptions<GeneType, FitnessValueType> {
  formatFitness: (fitness: FitnessValueType) => string
  formatGenes: (genes: GeneType[]) => string
  record:
    | PropagationRecord<GeneType, FitnessValueType>
    | PropagationTarget<GeneType, FitnessValueType>
    | null
  version: string
}

function renderRow<GeneType, FitnessValueType>(
  options: RecordRowOptions<GeneType, FitnessValueType>,
) {
  const {formatFitness, formatGenes, record, version} = options

  return html`
    <tr>
      <th scope="row">${version}</th>

      <td class="${styles.ChromosomeCell}" style="font-family: monospace;">
        ${record?.chromosome ? formatGenes(record.chromosome.genes) : ''}
      </td>

      <td style="text-align: right;">${record ? formatFitness(record.fitness.value) : ''}</td>

      <td style="text-align: right;">
        ${record != null && 'iteration' in record && record.iteration >= 0 ? record.iteration : ''}
      </td>
    </tr>
  `
}

function defaultFormatFitness<FitnessValueType>(fitness: FitnessValueType): string {
  return String(fitness)
}

function defaultFormatGenes<GeneType>(genes: GeneType[]): string {
  return genes.join('')
}

export class ChromosomeTableElement<GeneType, FitnessValueType> extends BaseElement {
  private declare best: PropagationRecord<GeneType, FitnessValueType> | null
  private declare current: PropagationRecord<GeneType, FitnessValueType> | null
  private declare first: PropagationRecord<GeneType, FitnessValueType> | null
  private declare formatFitness?: (fitness: FitnessValueType) => string
  private declare formatGenes?: (genes: GeneType[]) => string
  private declare target: PropagationTarget<GeneType, FitnessValueType> | null

  static get properties() {
    return {
      best: {type: Object},
      current: {type: Object},
      first: {type: Object},
      formatFitness: {type: Function},
      formatGenes: {type: Function},
      target: {type: Object},
    }
  }

  protected render() {
    const {formatFitness = defaultFormatFitness, formatGenes = defaultFormatGenes} = this

    return html`
      <table class=${styles.ChromosomeTable}>
        <caption>
          Chromosomes
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
          ${renderRow({formatFitness, formatGenes, record: this.target, version: 'Target'})}
          ${renderRow({formatFitness, formatGenes, record: this.first, version: 'First'})}
          ${renderRow({formatFitness, formatGenes, record: this.best, version: 'Best'})}
          ${renderRow({formatFitness, formatGenes, record: this.current, version: 'Current'})}
        </tbody>
      </table>
    `
  }
}

defineElement('chromosome-table', ChromosomeTableElement)
