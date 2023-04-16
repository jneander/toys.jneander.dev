import {ComponentProps, createElement} from 'react'

import {defineElement} from '../../../../../shared/views'
import type {AppController} from '../../app-controller'
import type {AppStore} from '../../types'
import {ReactLitElement} from '../../views'
import {SimulationRunningActivity} from '.'

export class SimulationRunningActivityElement extends ReactLitElement {
  public declare controller: AppController
  public declare store: AppStore

  static get properties() {
    return {
      controller: {type: Object},
      store: {type: Object},
    }
  }

  protected createElement() {
    const props: ComponentProps<typeof SimulationRunningActivity> = {
      appController: this.controller,
      appStore: this.store,
    }

    return createElement(SimulationRunningActivity, props)
  }
}

defineElement('simulation-running-activity', SimulationRunningActivityElement)
