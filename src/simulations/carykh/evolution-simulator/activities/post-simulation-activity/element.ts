import {Store} from '@jneander/utils-state'
import {html} from 'lit'
import {createElement} from 'react'
import {createRoot, Root} from 'react-dom/client'

import {BaseElement, defineElement} from '../../../../../shared/views'
import type {AppController} from '../../app-controller'
import {CreatureGridAdapter, SortingCreaturesAdapter} from '../../creature-collection-view'
import {P5ClientViewAdapter} from '../../p5-utils'
import type {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'
import {CullCreaturesView} from './cull-creatures-view'
import {PropagateCreaturesView} from './propagate-creatures-view'
import {SimulationFinishedView} from './simulation-finished-view'
import {SortedCreaturesView} from './sorted-creatures-view'
import {SortingCreaturesView} from './sorting-creatures-view'
import type {ActivityState} from './types'

export class PostSimulationActivityElement extends BaseElement {
  public declare controller: AppController
  public declare store: AppStore

  private activityViewRoot?: Root
  private activityStore?: Store<ActivityState>
  private activityController?: ActivityController
  private creatureCollectionAdapter?: P5ClientViewAdapter

  private storeListeners: (() => void)[] = []

  static get properties() {
    return {
      controller: {type: Object},
      store: {type: Object},
    }
  }

  connectedCallback(): void {
    this.activityStore = new Store<ActivityState>({
      currentActivityStep: ActivityStep.SimulationFinished,
    })

    this.activityController = new ActivityController({
      activityStore: this.activityStore,
      appController: this.controller,
      appStore: this.store,
    })

    this.storeListeners.push(
      this.activityStore.subscribe(() => {
        this.requestUpdate()
      }),
    )

    super.connectedCallback()
  }

  disconnectedCallback(): void {
    this.storeListeners.forEach(fn => {
      fn()
    })
    this.storeListeners.length = 0

    this.activityViewRoot?.unmount()

    super.disconnectedCallback()
  }

  protected update(changedProperties: Map<PropertyKey, unknown>): void {
    const {currentActivityStep} = this.activityStore?.getState() ?? {}

    if (currentActivityStep === ActivityStep.SortingCreatures) {
      const onAnimationFinished = () => {
        this.activityController?.setCurrentActivityStep(ActivityStep.SortedCreatures)
      }

      this.creatureCollectionAdapter = new SortingCreaturesAdapter({
        appStore: this.store,
        onAnimationFinished,
      })
    } else {
      const getCreatureAndGridIndexFn = (index: number) => {
        if (this.activityController == null) {
          throw new Error('ActivityController is not defined')
        }

        return this.activityController.getCreatureAndGridIndex(index) || 0
      }

      const showsPopupSimulation = () =>
        this.activityController?.currentStepShowsPopupSimulation() || false

      this.creatureCollectionAdapter = new CreatureGridAdapter({
        appController: this.controller,
        appStore: this.store,
        getCreatureAndGridIndexFn,
        showsPopupSimulation,
      })
    }

    super.update(changedProperties)
  }

  protected firstUpdated(): void {
    const activityViewContainer = this.querySelector('#activity-view')
    if (activityViewContainer) {
      this.activityViewRoot = createRoot(activityViewContainer)
    }
  }

  protected updated(): void {
    const {currentActivityStep} = this.activityStore?.getState() ?? {}

    if (!(this.activityController && this.controller && this.store)) {
      return
    }

    let element

    if (currentActivityStep === ActivityStep.SortingCreatures) {
      element = createElement(SortingCreaturesView, {
        activityController: this.activityController,
      })
    }

    if (currentActivityStep === ActivityStep.SortedCreatures) {
      element = createElement(SortedCreaturesView, {
        activityController: this.activityController,
        appController: this.controller,
      })
    }

    if (currentActivityStep === ActivityStep.CullCreatures) {
      element = createElement(CullCreaturesView, {
        activityController: this.activityController,
        appController: this.controller,
      })
    }

    if (currentActivityStep === ActivityStep.PropagateCreatures) {
      element = createElement(PropagateCreaturesView, {
        activityController: this.activityController,
        appStore: this.store,
      })
    }

    if (currentActivityStep === ActivityStep.SimulationFinished) {
      element = createElement(SimulationFinishedView, {
        activityController: this.activityController,
        appController: this.controller,
      })
    }

    this.activityViewRoot?.render(element)
  }

  protected render() {
    return html`
      <div class="flow">
        <creature-collection-view
          .adapter=${this.creatureCollectionAdapter}
        ></creature-collection-view>

        <div id="activity-view"></div>
      </div>
    `
  }
}

defineElement('post-simulation-activity', PostSimulationActivityElement)
