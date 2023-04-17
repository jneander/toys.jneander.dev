import {Store} from '@jneander/utils-state'
import {html} from 'lit'

import {BaseElement, defineElement} from '../../../../../shared/views'
import type {AppController} from '../../app-controller'
import {CREATURE_COUNT} from '../../constants'
import {CreatureGridAdapter, SortingCreaturesAdapter} from '../../creature-collection-view'
import {P5ClientViewAdapter} from '../../p5-utils'
import type {AppStore} from '../../types'
import {ActivityController} from './activity-controller'
import {ActivityStep} from './constants'
import type {ActivityState} from './types'

export class PostSimulationActivityElement extends BaseElement {
  public declare controller: AppController
  public declare store: AppStore

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

  protected render() {
    const {currentActivityStep} = this.activityStore?.getState() ?? {}

    let activityContent

    if (currentActivityStep === ActivityStep.SimulationFinished) {
      const handleSortClick = () => {
        this.controller.sortCreatures()
        this.controller.updateHistory()
        this.activityController?.setCurrentActivityStep(ActivityStep.SortingCreatures)
      }

      activityContent = html`
        <p>All 1,000 creatures have been tested. Now let's sort them!</p>

        <button @click=${handleSortClick} type="button">Sort</button>
      `
    }

    if (currentActivityStep === ActivityStep.SortingCreatures) {
      const handleSkipClick = () => {
        this.activityController?.setCurrentActivityStep(ActivityStep.SortedCreatures)
      }

      activityContent = html`<button @click=${handleSkipClick} type="button">Skip</button>`
    }

    if (currentActivityStep === ActivityStep.SortedCreatures) {
      const handleCullClick = () => {
        this.controller.cullCreatures()
        this.activityController?.setCurrentActivityStep(ActivityStep.CullCreatures)
      }

      activityContent = html`
        <p>
          Fastest creatures at the top! Slowest creatures at the bottom. (Going backward = slow)
        </p>

        <button @click=${handleCullClick} type="button">
          Kill ${Math.floor(CREATURE_COUNT / 2)}
        </button>
      `
    }

    if (currentActivityStep === ActivityStep.CullCreatures) {
      const handlePropagateClick = () => {
        this.controller.propagateCreatures()
        this.activityController?.setCurrentActivityStep(ActivityStep.PropagateCreatures)
      }

      activityContent = html`
        <p>
          Faster creatures are more likely to survive because they can outrun their predators. Slow
          creatures get eaten.
        </p>

        <p>Because of random chance, a few fast ones get eaten, while a few slow ones survive.</p>

        <button @click=${handlePropagateClick} type="button">Reproduce</button>
      `
    }

    if (currentActivityStep === ActivityStep.PropagateCreatures) {
      const handleBackClick = () => {
        this.activityController?.finishPostSimulation()
      }

      activityContent = html`
        <p>
          These are the ${CREATURE_COUNT} creatures of generation
          #${this.store.getState().generationCount + 1}.
        </p>

        <p>What perils will they face? Find out next time!</p>

        <button @click=${handleBackClick} type="button">Back</button>
      `
    }

    return html`
      <div class="flow">
        <creature-collection-view
          .adapter=${this.creatureCollectionAdapter}
        ></creature-collection-view>

        ${activityContent}
      </div>
    `
  }
}

defineElement('post-simulation-activity', PostSimulationActivityElement)
