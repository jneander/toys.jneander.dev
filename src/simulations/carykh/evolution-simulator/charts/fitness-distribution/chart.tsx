import {Chart} from 'chart.js'
import {useEffect, useRef} from 'react'

import {FITNESS_PERCENTILE_MEDIAN_INDEX} from '../../constants'
import {
  fitnessToHistogramBarIndex,
  histogramBarIndexToApproximateFitness
} from '../../creatures'

import {AppState, AppStore} from '../../types'
import {createConfiguration} from './configuration'

export interface FitnessDistributionChartProps {
  appStore: AppStore
}

export function FitnessDistributionChart(props: FitnessDistributionChartProps) {
  const {appStore} = props

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')
    const config = createConfiguration()

    const chart = new Chart(ctx!, config)

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

          const yScale = chart.options.scales!.y!

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

          yScale.ticks!.callback = v => {
            if (Number(v) % yAxisTickModulo === 0) {
              return v
            }
          }

          const medianFitness =
            fitnessPercentiles[FITNESS_PERCENTILE_MEDIAN_INDEX]
          const medianBarIndex = fitnessToHistogramBarIndex(medianFitness)

          const backgroundColor = new Array(histogramBarCounts.length).fill(
            '#000000'
          )
          // Use a different color to identify the median fitness bar.
          backgroundColor[medianBarIndex] = '#FF0000'

          data.datasets = [
            {
              barPercentage: 1,
              backgroundColor,

              data: histogramBarCounts.map((count, index) => {
                return {
                  x: histogramBarIndexToApproximateFitness(index),
                  y: count
                }
              })
            }
          ]
        }

        chart.update()
      }

      lastSelectedGeneration = selectedGeneration
    }

    updateHistoryData(appStore.getState())

    const unsubscribe = appStore.subscribe(updateHistoryData)

    return () => {
      unsubscribe()
      chart.destroy()
    }
  }, [appStore])

  return <canvas ref={canvasRef} />
}
