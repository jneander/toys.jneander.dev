import {ComponentProps, createElement} from 'react'

import type {AppController} from '../app-controller'
import type {AppStore} from '../types'
import {ReactLitElement} from '../views'
import {GenerateCreaturesActivity} from './generate-creatures-activity'

export class GenerateCreaturesActivityElement extends ReactLitElement {
  public declare controller: AppController
  public declare store: AppStore

  static get properties() {
    return {
      controller: {type: Object},
      store: {type: Object},
    }
  }

  protected createElement() {
    const props: ComponentProps<typeof GenerateCreaturesActivity> = {
      appController: this.controller,
      appStore: this.store,
    }

    return createElement(GenerateCreaturesActivity, props)
  }
}

if (!customElements.get('generate-creatures-activity')) {
  window.customElements.define('generate-creatures-activity', GenerateCreaturesActivityElement)
}
