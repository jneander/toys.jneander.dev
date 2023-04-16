import {LitElement} from 'lit'
import p5 from 'p5'

import type {P5Sketch} from './types'

export class P5ViewElement extends LitElement {
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

if (!customElements.get('p5-view')) {
  window.customElements.define('p5-view', P5ViewElement)
}
