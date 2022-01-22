import {
  ActivityId,
  CREATURE_COUNT,
  GenerationSimulationMode,
  SCALE_TO_FIX_BUG
} from '../constants'
import {CreatureDrawer} from '../creature-drawer'
import {creatureIdToIndex} from '../helpers'
import {ButtonWidget, CREATURE_GRID_TILES_PER_ROW} from '../views'
import {Activity, ActivityConfig} from './shared'

export class SortingCreaturesActivity extends Activity {
  private creatureDrawer: CreatureDrawer

  private skipButton: SkipButton

  private activityTimer: number

  constructor(config: ActivityConfig) {
    super(config)

    this.creatureDrawer = new CreatureDrawer({appView: this.appView})

    this.skipButton = new SkipButton({
      appState: this.appState,
      appView: this.appView,

      onClick: () => {
        this.activityTimer = 100000
      }
    })

    this.activityTimer = 0
  }

  draw(): void {
    const {appState, appView} = this
    const {canvas} = appView

    canvas.background(220, 253, 102)
    canvas.push()
    canvas.scale(10.0 / SCALE_TO_FIX_BUG)

    const transition =
      0.5 - 0.5 * Math.cos(Math.min(this.activityTimer / 60, Math.PI))

    for (let i2 = 0; i2 < CREATURE_COUNT; i2++) {
      // i2 is the index of where the creature is now
      const creature = appState.sortedCreatures[i2]

      // i1 is the index of where the creature was
      const i1 = creatureIdToIndex(creature.id)

      const x1 = i1 % CREATURE_GRID_TILES_PER_ROW
      const y1 = Math.floor(i1 / CREATURE_GRID_TILES_PER_ROW)
      const x2 = i2 % CREATURE_GRID_TILES_PER_ROW
      const y2 = Math.floor(i2 / CREATURE_GRID_TILES_PER_ROW) + 1 // next grid is lower on canvas
      const x3 = this.interpolate(x1, x2, transition)
      const y3 = this.interpolate(y1, y2, transition)

      this.creatureDrawer.drawCreature(
        creature,
        x3 * 3 + 5.5,
        y3 * 2.5 + 4,
        canvas
      )
    }

    canvas.pop()

    this.skipButton.draw()
    if (appState.generationSimulationMode === GenerationSimulationMode.Quick) {
      this.activityTimer += 10
    } else {
      this.activityTimer += 2
    }

    if (this.activityTimer > 60 * Math.PI) {
      this.appController.setActivityId(ActivityId.SortedCreatures)
    }
  }

  onMouseReleased(): void {
    if (this.skipButton.isUnderCursor()) {
      this.skipButton.onClick()
    }
  }

  private interpolate(a: number, b: number, offset: number): number {
    return a + (b - a) * offset
  }
}

class SkipButton extends ButtonWidget {
  draw(): void {
    const {canvas, font, height} = this.appView

    canvas.fill(0)
    canvas.rect(0, height - 40, 90, 40)
    canvas.fill(255)
    canvas.textAlign(canvas.CENTER)
    canvas.textFont(font, 32)
    canvas.text('SKIP', 45, height - 8)
  }

  isUnderCursor(): boolean {
    const {appView} = this
    return appView.rectIsUnderCursor(0, appView.height - 40, 90, 40)
  }
}
