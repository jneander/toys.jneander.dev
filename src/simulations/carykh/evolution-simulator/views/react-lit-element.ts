import type {ReactElement} from 'react'
import {createRoot, Root} from 'react-dom/client'

import {BaseElement} from '../../../../shared/views'

export abstract class ReactLitElement extends BaseElement {
  private root?: Root

  static get properties() {
    return {
      controller: {type: Object},
      store: {type: Object},
    }
  }

  protected abstract createElement(): ReactElement

  connectedCallback(): void {
    this.root = createRoot(this)
    this.root.render(this.createElement())
  }

  disconnectedCallback(): void {
    this.root?.unmount()
  }
}
