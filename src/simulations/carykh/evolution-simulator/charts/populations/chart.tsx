import {ActiveDataPoint, Chart} from 'chart.js'
import {useEffect, useRef} from 'react'

import {AppState, AppStore} from '../../types'
import {createConfiguration} from './configuration'

export interface PopulationsChartProps {
  appStore: AppStore
}

export function PopulationsChart(props: PopulationsChartProps) {
  const {appStore} = props

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')
    const config = createConfiguration()

    const chart = new Chart(ctx!, config)

    let lastGenerationCount = 0
    let lastSelectedGeneration = -1

    function updateHistoryData(state: AppState) {
      const {generationCount, selectedGeneration} = state

      if (generationCount > lastGenerationCount) {
        const {data} = chart

        for (let g = lastGenerationCount + 1; g <= generationCount; g++) {
          data.labels!.push(g)

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
            index: selectedGeneration
          }
        ])

        const {chartArea} = chart
        const activeElements: ActiveDataPoint[] = []

        chart.data.datasets.forEach((dataset, index) => {
          if (dataset.data[selectedGeneration]! > 25) {
            activeElements.push({
              datasetIndex: index,
              index: selectedGeneration
            })
          }
        })

        chart.tooltip?.setActiveElements(
          activeElements,

          {
            x: (chartArea.left + chartArea.right) / 2,
            y: (chartArea.top + chartArea.bottom) / 2
          }
        )

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
