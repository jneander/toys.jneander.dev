import p5 from 'p5'

import {BaseElement, defineElement} from '../views'
import type {P5Sketch} from './types'

export class P5ViewElement extends BaseElement {
  private declare sketch: P5Sketch

  private instance?: p5

  static get properties() {
    return {
      sketch: {type: Object},
    }
  }

  connectedCallback(): void {
    const container = document.createElement('div')
    this.instance = new p5(this.sketch, container)
    this.appendChild(container)
  }

  disconnectedCallback(): void {
    this.instance?.remove()
    delete this.instance
  }
}

defineElement('p5-view', P5ViewElement)
