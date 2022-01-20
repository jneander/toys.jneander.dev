import {ActivityId} from '../constants'
import {ButtonWidget} from '../views'
import {Activity, ActivityConfig} from './shared'

export class StartActivity extends Activity {
  private startButton: StartButton

  constructor(config: ActivityConfig) {
    super(config)

    this.startButton = new StartButton({
      appState: this.appState,
      appView: this.appView,

      onClick: () => {
        this.appController.setActivityId(ActivityId.GenerationView)
      }
    })
  }

  initialize(): void {
    const {canvas, width} = this.appView

    canvas.background(255)
    canvas.noStroke()
    canvas.fill(0)
    canvas.text('EVOLUTION!', width / 2, 200)

    this.startButton.draw()
  }

  onMouseReleased(): void {
    if (this.startButton.isUnderCursor()) {
      this.startButton.onClick()
    }
  }
}

class StartButton extends ButtonWidget {
  draw(): void {
    const {canvas, width} = this.appView

    canvas.noStroke()
    canvas.fill(100, 200, 100)
    canvas.rect(width / 2 - 200, 300, 400, 200)
    canvas.fill(0)
    canvas.text('START', width / 2, 430)
  }

  isUnderCursor(): boolean {
    const {appView} = this
    return appView.rectIsUnderCursor(appView.width / 2 - 200, 300, 400, 200)
  }
}
