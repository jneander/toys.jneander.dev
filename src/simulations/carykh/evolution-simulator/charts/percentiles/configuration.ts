import {ChartConfiguration, ChartData} from 'chart.js'

import {FITNESS_PERCENTILE_CREATURE_INDICES} from '../../constants'

import './controller'

function createInitialData(): ChartData {
  const data: ChartData = {
    datasets: [],
    labels: [0]
  }

  FITNESS_PERCENTILE_CREATURE_INDICES.forEach(creatureIndex => {
    const percentile = Math.round(creatureIndex / 10) // 0, 1, ..., 100

    data.datasets.push({
      borderColor: creatureIndex === 500 ? '#FF0000' : '#000000',
      borderWidth: percentile % 10 === 0 ? 2 : 1,
      data: [0],
      fill: false,
      label: `Percentile ${percentile}`,
      pointHitRadius: 0,
      pointHoverRadius: 0,
      pointRadius: 0
    })
  })

  return data
}

export function createConfiguration(): ChartConfiguration {
  return {
    data: createInitialData(),

    options: {
      // Ignore hover to avoid changing programmatically-set active elements.
      events: [],

      interaction: {
        axis: 'x',
        intersect: false,
        mode: 'index'
      },

      responsive: true,

      scales: {
        x: {
          title: {
            display: true,
            text: 'Generation'
          }
        },

        y: {
          title: {
            display: true,
            text: 'Fitness'
          }
        }
      }
    },

    type: 'percentiles'
  }
}
