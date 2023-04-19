import {BaseElement, defineElement} from '../../../../shared/views'
import {P5ViewController} from './p5-view-controller'
import type {P5ViewAdapter} from './types'

export class P5ViewElement extends BaseElement {
  private declare adapter: P5ViewAdapter

  private controller?: P5ViewController
  private container: HTMLDivElement

  static get properties() {
    return {
      adapter: {type: Object},
    }
  }

  constructor() {
    super()

    this.container = document.createElement('div')
  }

  connectedCallback(): void {
    this.appendChild(this.container)

    this.controller = new P5ViewController(this.container)
    this.controller.setAdapter(this.adapter)
    this.controller.initialize()

    super.connectedCallback()
  }

  disconnectedCallback(): void {
    this.controller?.deinitialize()
    delete this.controller

    super.disconnectedCallback()
  }

  protected update(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has('adapter')) {
      this.controller?.setAdapter(this.adapter)
    }

    super.update(changedProperties)
  }
}

defineElement('p5-view', P5ViewElement)
