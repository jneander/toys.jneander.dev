import {LitElement} from 'lit'
import type {ReactElement} from 'react'
import {createRoot, Root} from 'react-dom/client'

export abstract class ReactLitElement extends LitElement {
  private root?: Root

  static get properties() {
    return {
      controller: {type: Object},
      store: {type: Object},
    }
  }

  protected abstract createElement(): ReactElement

  createRenderRoot() {
    return this
  }

  connectedCallback(): void {
    this.root = createRoot(this)
    this.root.render(this.createElement())
  }

  disconnectedCallback(): void {
    this.root?.unmount()
  }
}
