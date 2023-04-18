import p5 from 'p5'

import {BaseElement, defineElement} from '../../../../shared/views'
import {P5ClientViewController} from './p5-client-view-controller'
import type {P5ViewAdapter} from './types'

export class P5ViewElement extends BaseElement {
  private declare clientViewAdapter: P5ViewAdapter
  private declare height?: number
  private declare scale?: number
  private declare width?: number

  private clientViewController?: P5ClientViewController
  private container: HTMLDivElement
  private instance?: p5

  static get properties() {
    return {
      clientViewAdapter: {type: Object},
      height: {type: Number},
      scale: {type: Number},
      width: {type: Number},
    }
  }

  constructor() {
    super()

    this.container = document.createElement('div')
  }

  connectedCallback(): void {
    this.appendChild(this.container)

    this.clientViewController = new P5ClientViewController({
      height: this.height,
      scale: this.scale,
      width: this.width,
    })

    this.instance = new p5(this.clientViewController.sketch, this.container)

    this.clientViewController.setAdapter(this.clientViewAdapter)

    super.connectedCallback()
  }

  disconnectedCallback(): void {
    this.instance?.remove()
    delete this.instance

    super.disconnectedCallback()
  }

  protected update(changedProperties: Map<PropertyKey, unknown>): void {
    if (['height', 'scale', 'width'].some(property => changedProperties.has(property))) {
      this.clientViewController = new P5ClientViewController({
        height: this.height,
        scale: this.scale,
        width: this.width,
      })

      this.instance?.remove()
      this.instance = new p5(this.clientViewController.sketch, this.container)
    }

    this.clientViewController?.setAdapter(this.clientViewAdapter)

    super.update(changedProperties)
  }
}

defineElement('p5-view', P5ViewElement)
