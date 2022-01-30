import {ChartConfiguration, ChartData} from 'chart.js'

import {
  HISTOGRAM_BARS_PER_METER,
  HISTOGRAM_BAR_MAX,
  HISTOGRAM_BAR_MIN
} from '../../constants'
import {histogramBarIndexToApproximateFitness} from '../../creatures'

import './controller'

function createInitialData(): ChartData {
  const data: ChartData = {
    datasets: [],
    labels: []
  }

  for (let i = HISTOGRAM_BAR_MIN; i <= HISTOGRAM_BAR_MAX; i++) {
    data.labels!.push(i / HISTOGRAM_BARS_PER_METER)
  }

  return data
}

export function createConfiguration(): ChartConfiguration {
  return {
    data: createInitialData(),

    options: {
      animation: false,

      interaction: {
        axis: 'x',
        intersect: false,
        mode: 'index'
      },

      plugins: {
        tooltip: {
          callbacks: {
            title(tooltipItems) {
              const {dataIndex} = tooltipItems[0]
              const currentFitness =
                histogramBarIndexToApproximateFitness(dataIndex)
              const nextFitness = histogramBarIndexToApproximateFitness(
                dataIndex + 1
              )

              return `${currentFitness} – ${nextFitness}`
            }
          },

          enabled: true
        }
      },

      responsive: true,

      scales: {
        x: {
          title: {
            display: true,
            text: 'Fitness'
          }
        },

        y: {
          ticks: {
            callback(v) {
              if (Number(v) % 100 === 0) {
                return v
              }
            }
          },

          title: {
            display: true,
            text: 'Creatures'
          }
        }
      }
    },

    type: 'bar'
  }
}
