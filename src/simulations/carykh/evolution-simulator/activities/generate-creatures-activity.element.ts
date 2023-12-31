import '../creature-collection-view/creature-collection-view.element'

import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../shared/views'
import type {AppController} from '../app-controller'
import {ActivityId, CREATURE_COUNT} from '../constants'
import {CreatureGridAdapter} from '../creature-collection-view'
import type {AppStore} from '../types'

export class GenerateCreaturesActivityElement extends BaseElement {
  private declare controller: AppController
  private declare store: AppStore

  private creatureCollectionAdapter?: CreatureGridAdapter

  static get properties() {
    return {
      controller: {type: Object},
      store: {type: Object},
    }
  }

  connectedCallback(): void {
    const getCreatureAndGridIndexFn = (index: number) => {
      return {
        creature: this.store.getState().creaturesInLatestGeneration[index],
        gridIndex: index,
      }
    }

    this.creatureCollectionAdapter = new CreatureGridAdapter({
      appController: this.controller,
      appStore: this.store,
      getCreatureAndGridIndexFn,
      showsPopupSimulation: () => false,
    })

    super.connectedCallback()
  }

  protected render() {
    return html`
      <div class="flow">
        <creature-collection-view
          .adapter=${this.creatureCollectionAdapter}
        ></creature-collection-view>

        <p>Here are your ${CREATURE_COUNT} randomly generated creatures!!!</p>

        <button @click=${this.handleBackClick} type="button">Back</button>
      </div>
    `
  }

  private handleBackClick(): void {
    this.store.setState({generationCount: 0})
    this.controller.setActivityId(ActivityId.GenerationView)
  }
}

defineElement('generate-creatures-activity', GenerateCreaturesActivityElement)
