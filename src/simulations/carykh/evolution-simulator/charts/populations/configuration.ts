import {ChartConfiguration, ChartData} from 'chart.js'

import {
  getSpeciesColorHslString,
  speciesIdFromNodesAndMuscles
} from '../../creatures'

import './controller'

function createInitialData(): ChartData {
  const data: ChartData = {
    datasets: [],
    labels: [0]
  }

  for (let nodeCount = 0; nodeCount < 10; nodeCount++) {
    for (let muscleCount = 0; muscleCount < 10; muscleCount++) {
      const speciesId = speciesIdFromNodesAndMuscles(nodeCount, muscleCount)
      const hsl = getSpeciesColorHslString(speciesId, false)

      data.datasets.push({
        backgroundColor: hsl,
        borderWidth: 1,
        data: [0],
        fill: true,
        label: `S${speciesId}`,
        order: 100 - speciesId, // Order species top to bottom.
        pointHitRadius: 0,
        pointHoverRadius: 0,
        pointRadius: 0
      })
    }
  }

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

      plugins: {
        tooltip: {
          callbacks: {
            title() {
              return ''
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
            text: 'Generation'
          }
        },

        y: {
          stacked: true,

          title: {
            display: true,
            text: 'Population'
          }
        }
      }
    },

    type: 'populations'
  }
}
