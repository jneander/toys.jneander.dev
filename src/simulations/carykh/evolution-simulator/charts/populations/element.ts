import {ActiveDataPoint, Chart} from 'chart.js'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../../shared/views'
import type {AppState, AppStore} from '../../types'
import {createConfiguration} from './configuration'

export class PopulationsChartElement extends BaseElement {
  private declare store: AppStore

  private unsubscribeStore?: () => void
  private chart?: Chart<'populations', number[]>

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
    const canvas = this.querySelector('canvas') as HTMLCanvasElement

    const ctx = canvas?.getContext('2d')
    if (!ctx) {
      return
    }

    const config = createConfiguration()

    const chart = new Chart<'populations', number[]>(ctx, config)
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
          const speciesCounts = new Array(100).fill(0)

          historyEntry.speciesCounts.forEach(speciesCount => {
            speciesCounts[speciesCount.speciesId] = speciesCount.count
          })

          speciesCounts.forEach((count, index) => {
            data.datasets[index].data.push(count)
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

        const {chartArea} = chart
        const activeElements: ActiveDataPoint[] = []

        chart.data.datasets.forEach((dataset, index) => {
          if (
            Number.isFinite(dataset.data[selectedGeneration]) &&
            (dataset.data[selectedGeneration] as number) > 25
          ) {
            activeElements.push({
              datasetIndex: index,
              index: selectedGeneration,
            })
          }
        })

        chart.tooltip?.setActiveElements(
          activeElements,

          {
            x: (chartArea.left + chartArea.right) / 2,
            y: (chartArea.top + chartArea.bottom) / 2,
          },
        )

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

defineElement('populations-chart', PopulationsChartElement)
