import '../../../../shared/p5/p5-view.element'

import {html, LitElement} from 'lit'

import {P5ClientViewController} from './p5-client-view-controller'
import type {P5ClientViewAdapter} from './types'

export class P5ControlledClientViewElement extends LitElement {
  private declare clientViewAdapter: P5ClientViewAdapter
  private declare height?: number
  private declare scale?: number
  private declare width?: number

  private clientViewController?: P5ClientViewController

  static get properties() {
    return {
      clientViewAdapter: {type: Object},
      height: {type: Number},
      scale: {type: Number},
      width: {type: Number},
    }
  }

  createRenderRoot() {
    return this
  }

  connectedCallback(): void {
    this.clientViewController = new P5ClientViewController({
      height: this.height,
      scale: this.scale,
      width: this.width,
    })

    this.clientViewController.setAdapter(this.clientViewAdapter)

    super.connectedCallback()
  }

  protected render() {
    return html`<p5-view .sketch=${this.clientViewController?.sketch}></p5-view>`
  }
}

if (!customElements.get('p5-controlled-client-view')) {
  window.customElements.define('p5-controlled-client-view', P5ControlledClientViewElement)
}
