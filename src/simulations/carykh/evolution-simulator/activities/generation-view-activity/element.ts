import {ComponentProps, createElement} from 'react'

import {defineElement} from '../../../../../shared/views'
import type {AppController} from '../../app-controller'
import type {AppStore} from '../../types'
import {ReactLitElement} from '../../views'
import {GenerationViewActivity} from '.'

export class GenerationViewActivityElement extends ReactLitElement {
  public declare controller: AppController
  public declare store: AppStore

  static get properties() {
    return {
      controller: {type: Object},
      store: {type: Object},
    }
  }

  protected createElement() {
    const props: ComponentProps<typeof GenerationViewActivity> = {
      appController: this.controller,
      appStore: this.store,
    }

    return createElement(GenerationViewActivity, props)
  }
}

defineElement('generation-view-activity', GenerationViewActivityElement)
