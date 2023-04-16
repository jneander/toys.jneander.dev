import p5 from 'p5'

import {BaseElement, defineElement} from '../views'
import type {P5Sketch} from './types'

export class P5ViewElement extends BaseElement {
  private declare sketch: P5Sketch

  private container: HTMLDivElement
  private instance?: p5

  static get properties() {
    return {
      sketch: {type: Object},
    }
  }

  constructor() {
    super()

    this.container = document.createElement('div')
  }

  connectedCallback(): void {
    this.appendChild(this.container)

    super.connectedCallback()
  }

  protected updated(changedProperties: Map<PropertyKey, unknown>): void {
    this.instance?.remove()
    this.instance = new p5(this.sketch, this.container)

    super.updated(changedProperties)
  }

  disconnectedCallback(): void {
    this.instance?.remove()
    delete this.instance

    super.disconnectedCallback()
  }
}

defineElement('p5-view', P5ViewElement)
