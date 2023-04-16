import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../shared/views'
import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'

export class StartActivityElement extends BaseElement {
  public declare controller: AppController

  static get properties() {
    return {
      controller: {type: Object},
    }
  }

  render() {
    return html`
      <div class="flow">
        <h2>Evolution!</h2>

        <p>
          Since there are no creatures yet, create ${CREATURE_COUNT} creatures! They will be
          randomly created, and also very simple.
        </p>

        <button @click=${this.handleCreateClick} type="button">Create</button>
      </div>
    `
  }

  private handleCreateClick() {
    this.controller.generateCreatures()
    this.controller.setActivityId(ActivityId.GenerateCreatures)
  }
}

defineElement('start-activity', StartActivityElement)
