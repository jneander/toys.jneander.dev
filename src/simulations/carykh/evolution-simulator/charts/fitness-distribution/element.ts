import {Chart, ChartType, ChartTypeRegistry, ScaleOptionsByType} from 'chart.js'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../../shared/views'
import {FITNESS_PERCENTILE_MEDIAN_INDEX} from '../../constants'
import {fitnessToHistogramBarIndex, histogramBarIndexToApproximateFitness} from '../../creatures'
import type {AppState, AppStore} from '../../types'
import {createConfiguration} from './configuration'

export class FitnessDistributionChartElement extends BaseElement {
  private declare store: AppStore

  private unsubscribeStore?: () => void
  private chart?: Chart<'bar', {x: number; y: number}[], unknown>

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

    const chart = new Chart<'bar', {x: number; y: number}[]>(ctx, config)
    this.chart = chart

    let lastSelectedGeneration = -1

    function updateHistoryData(state: AppState) {
      const {selectedGeneration} = state

      if (selectedGeneration !== lastSelectedGeneration) {
        const {data} = chart

        data.datasets = []

        const historyEntry = state.generationHistoryMap[selectedGeneration]

        if (historyEntry) {
          const {fitnessPercentiles, histogramBarCounts} = historyEntry
          const maxCount = Math.max(...histogramBarCounts)

          const yScale = chart.options.scales?.y as ScaleOptionsByType<
            ChartTypeRegistry[ChartType]['scales']
          >

          /*
           * Set the vertical scale to consistently fit the tallest bar in the
           * lower 90% of the vertical space. This has the effect of normalizing
           * the vertical scale of the graph across generations.
           */
          yScale.max = maxCount / 0.9

          /*
           * As the vertical scale is adjusted downward, fewer ticks are present
           * to label the vertical axis. Reduce the tick filter using the y
           * scale's tick callback.
           */
          let yAxisTickModulo = 100
          if (maxCount < 50) {
            yAxisTickModulo = 10
          } else if (maxCount < 100) {
            yAxisTickModulo = 20
          } else if (maxCount < 300) {
            yAxisTickModulo = 50
          }

          yScale.ticks.callback = v => {
            if (Number(v) % yAxisTickModulo === 0) {
              return v
            }
          }

          const medianFitness = fitnessPercentiles[FITNESS_PERCENTILE_MEDIAN_INDEX]
          const medianBarIndex = fitnessToHistogramBarIndex(medianFitness)

          const backgroundColor = new Array(histogramBarCounts.length).fill('#000000')
          // Use a different color to identify the median fitness bar.
          backgroundColor[medianBarIndex] = '#FF0000'

          data.datasets = [
            {
              barPercentage: 1,
              backgroundColor,

              data: histogramBarCounts.map((count, index) => {
                return {
                  x: histogramBarIndexToApproximateFitness(index),
                  y: count,
                }
              }),
            },
          ]
        }

        chart.update()
      }

      lastSelectedGeneration = selectedGeneration
    }

    updateHistoryData(this.store.getState())

    this.unsubscribeStore = this.store.subscribe(updateHistoryData)

    super.firstUpdated(changedProperties)
  }

  protected render() {
    return html`<canvas></canvas>`
  }
}

defineElement('fitness-distribution-chart', FitnessDistributionChartElement)
