import {Chart} from 'chart.js'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../../shared/views'
import type {AppState, AppStore} from '../../types'
import {createConfiguration} from './configuration'

export class PercentilesChartElement extends BaseElement {
  private declare store: AppStore

  private unsubscribeStore?: () => void
  private chart?: Chart<'percentiles', number[]>

  static get properties() {
    return {
      store: {type: Object},
    }
  }

  disconnectedCallback(): void {
    this.unsubscribeStore?.()
    delete this.unsubscribeStore

    this.chart?.destroy()

    super.disconnectedCallback()
  }

  protected firstUpdated(changedProperties: Map<PropertyKey, unknown>): void {
    const canvas: HTMLCanvasElement = this.querySelector('canvas') as HTMLCanvasElement

    const ctx = canvas?.getContext('2d')
    if (!ctx) {
      return
    }

    const config = createConfiguration()

    const chart = new Chart(ctx, config)
    this.chart = chart

    let lastGenerationCount = 0
    let lastSelectedGeneration = -1

    function updateHistoryData(state: AppState) {
      const {generationCount, selectedGeneration} = state

      if (generationCount > lastGenerationCount) {
        const {data} = chart

        for (let g = lastGenerationCount + 1; g <= generationCount; g++) {
          data.labels?.push(g)

          const historyEntry = state.generationHistoryMap[g]

          historyEntry.fitnessPercentiles.forEach((percentile, index) => {
            data.datasets[index].data.push(percentile)
          })
        }

        chart.update()
      }

      if (selectedGeneration !== lastSelectedGeneration) {
        chart.setActiveElements([
          {
            datasetIndex: 0,
            index: selectedGeneration,
          },
        ])

        chart.update()
      }

      lastSelectedGeneration = selectedGeneration
      lastGenerationCount = generationCount
    }

    updateHistoryData(this.store.getState())

    this.unsubscribeStore = this.store.subscribe(updateHistoryData)

    super.firstUpdated(changedProperties)
  }

  protected render() {
    return html`<canvas></canvas>`
  }
}

defineElement('percentiles-chart', PercentilesChartElement)
