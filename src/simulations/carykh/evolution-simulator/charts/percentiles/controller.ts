import {Chart, LineController} from 'chart.js'

import '../chart-js'

declare module 'chart.js' {
  interface ChartTypeRegistry {
    percentiles: ChartTypeRegistry['line']
  }
}

class PercentilesController extends LineController {
  static defaults = LineController.defaults
  static id = 'percentiles'

  draw(...args: Parameters<LineController['draw']>): void {
    super.draw(...args)

    const activeElements = this.chart.getActiveElements()
    if (activeElements.length === 0) {
      return
    }

    const {x} = activeElements[0].element

    let ctx = this.chart.ctx
    let topY = this.chart.scales.y.top
    let bottomY = this.chart.scales.y.bottom

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, topY)
    ctx.lineTo(x, bottomY)
    ctx.lineWidth = 3
    ctx.strokeStyle = '#00A000'
    ctx.stroke()
    ctx.restore()
  }
}

Chart.register(PercentilesController)
