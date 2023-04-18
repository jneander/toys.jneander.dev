import p5 from 'p5'

import {BaseElement, defineElement} from '../../../../shared/views'
import {P5ViewController} from './p5-view-controller'
import type {P5ViewAdapter} from './types'

export class P5ViewElement extends BaseElement {
  private declare adapter: P5ViewAdapter
  private declare height?: number
  private declare width?: number

  private controller?: P5ViewController
  private container: HTMLDivElement
  private instance?: p5

  static get properties() {
    return {
      adapter: {type: Object},
      height: {type: Number},
      width: {type: Number},
    }
  }

  constructor() {
    super()

    this.container = document.createElement('div')
  }

  connectedCallback(): void {
    this.appendChild(this.container)

    this.controller = new P5ViewController({
      height: this.height,
      width: this.width,
    })

    this.instance = new p5(this.controller.sketch, this.container)

    this.controller.setAdapter(this.adapter)

    super.connectedCallback()
  }

  disconnectedCallback(): void {
    this.instance?.remove()
    delete this.instance

    super.disconnectedCallback()
  }

  protected update(changedProperties: Map<PropertyKey, unknown>): void {
    if (['height', 'width'].some(property => changedProperties.has(property))) {
      this.controller = new P5ViewController({
        height: this.height,
        width: this.width,
      })

      this.instance?.remove()
      this.instance = new p5(this.controller.sketch, this.container)
    }

    this.controller?.setAdapter(this.adapter)

    super.update(changedProperties)
  }
}

defineElement('p5-view', P5ViewElement)
