import {Chart} from 'chart.js'
import {useEffect, useRef} from 'react'

import {AppState, AppStore} from '../../types'
import {createConfiguration} from './configuration'

export interface PercentilesChartProps {
  appStore: AppStore
}

export function PercentilesChart(props: PercentilesChartProps) {
  const {appStore} = props

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) {
      return
    }

    const config = createConfiguration()

    const chart = new Chart(ctx, config)

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

    updateHistoryData(appStore.getState())

    const unsubscribe = appStore.subscribe(updateHistoryData)

    return () => {
      unsubscribe()
      chart.destroy()
    }
  }, [appStore])

  return <canvas ref={canvasRef} />
}
