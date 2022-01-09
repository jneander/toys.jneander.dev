import type p5 from 'p5'
import type {Color, Font, Graphics} from 'p5'

import Rectangle from './Rectangle'
import {Activity} from './constants'

export default function sketch(p5: p5) {
  const CREATURE_COUNT = 1000
  const FRAME_RATE = 60 // target frames per second
  const FRICTION = 4
  const SEED = 0
  const windowSizeMultiplier = 0.8

  const lastCreatureIndex = CREATURE_COUNT - 1
  const midCreatureIndex = Math.floor(CREATURE_COUNT / 2) - 1

  const fitnessPercentileCreatureIndices = [
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700,
    800, 900, 910, 920, 930, 940, 950, 960, 970, 980, 990, 999
  ]
  const fitnessPercentileCount = fitnessPercentileCreatureIndices.length
  const fitnessPercentileHistory: Array<number[]> = []

  let font: Font
  let barCounts: Array<number[]> = []
  let speciesCounts: Array<number[]> = []
  let topSpeciesCounts: Array<number> = []
  let creatureDatabase: Array<Creature> = []
  let rects: Array<Rectangle> = []
  let graphImage: Graphics
  let screenImage: Graphics
  let popUpImage: Graphics
  let segBarImage: Graphics
  let haveGround = true
  let histBarsPerMeter = 5
  let operationNames = [
    '#',
    'time',
    'px',
    'py',
    '+',
    '-',
    '*',
    '÷',
    '%',
    'sin',
    'sig',
    'pres'
  ]
  let operationAxons = [0, 0, 0, 0, 2, 2, 2, 2, 2, 1, 1, 0]
  let operationCount = 12
  let fitnessUnit = 'm'
  let fitnessName = 'Distance'
  let baselineEnergy = 0.0
  let energyDirection = 1 // if 1, it'll count up how much energy is used.  if -1, it'll count down from the baseline energy, and when energy hits 0, the creature dies.
  let bigMutationChance = 0.06
  let hazelStairs = -1

  let pressureUnit = 500.0 / 2.37
  let energyUnit = 20
  let nauseaUnit = 5
  let minBar = -10
  let maxBar = 100
  let barLen = maxBar - minBar
  let gensToDo = 0
  let postFontSize = 0.96
  let scaleToFixBug = 1000
  let energy = 0
  let averageNodeNausea = 0
  let totalNodeNausea = 0

  let lineY1 = -0.08 // These are for the lines of text on each node.
  let lineY2 = 0.35
  let axonColor = p5.color(255, 255, 0)

  let windowWidth = 1280
  let windowHeight = 720
  let timer = 0
  let camX = 0
  let camY = 0
  let activity: Activity = Activity.Start
  let generationCount = -1
  let sliderX = 1170
  let selectedGeneration = 0
  let draggingSlider = false
  let creaturesTested = 0
  const fontSizes = [50, 36, 25, 20, 16, 14, 11, 9]

  let showPopupSimulation = false
  let popupSimulationCreatureId: number | null

  let statusWindow = -4
  let overallTimer = 0
  let simulationTimer = 0
  const creaturesInPosition = new Array<number>(CREATURE_COUNT)

  let camZoom = 0.015
  let gravity = 0.005
  let airFriction = 0.95

  let averageX: number
  let averageY: number
  let speed = 1
  let id: number
  let stepbystep: boolean
  let stepbystepslow: boolean
  let slowDies: boolean
  let timeShow: number

  function inter(a: number, b: number, offset: number): number {
    return a + (b - a) * offset
  }

  function r(): number {
    return p5.pow(p5.random(-1, 1), 19)
  }

  function getCursorPosition(): {mX: number; mY: number} {
    const mX = p5.mouseX / windowSizeMultiplier
    const mY = p5.mouseY / windowSizeMultiplier

    return {mX, mY}
  }

  function rectIsUnderCursor(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    const {mX, mY} = getCursorPosition()

    return mX >= x && mX <= x + width && mY >= y && mY <= y + height
  }

  abstract class Widget {
    abstract draw(): void
  }

  class StartViewStartButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(windowWidth / 2 - 200, 300, 400, 200)
      p5.fill(0)
      p5.text('START', windowWidth / 2, 430)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(windowWidth / 2 - 200, 300, 400, 200)
    }

    onClick(): void {
      setActivity(Activity.GenerationView)
    }
  }

  class GenerationViewCreateButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(20, 250, 200, 100)
      p5.fill(0)
      p5.text('CREATE', 56, 312)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(20, 250, 200, 100)
    }

    onClick(): void {
      setActivity(Activity.GeneratingCreatures)
    }
  }

  class GeneratedCreaturesBackButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 100, 200)
      p5.rect(900, 664, 260, 40)
      p5.fill(0)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 24)
      p5.text('Back', windowWidth - 250, 690)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      generationCount = 0
      setActivity(Activity.GenerationView)
    }
  }

  class SimulateStepByStepButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(760, 20, 460, 40)
      p5.fill(0)
      p5.text('Do 1 step-by-step generation.', 770, 50)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(760, 20, 460, 40)
    }

    onClick(): void {
      setActivity(Activity.RequestingSimulation)
      speed = 1
      creaturesTested = 0
      stepbystep = true
      stepbystepslow = true
    }
  }

  class SimulateQuickButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(760, 70, 460, 40)
      p5.fill(0)
      p5.text('Do 1 quick generation.', 770, 100)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(760, 70, 460, 40)
    }

    onClick(): void {
      setActivity(Activity.RequestingSimulation)
      creaturesTested = 0
      stepbystep = true
      stepbystepslow = false
    }
  }

  class SimulateAsapButton extends Widget {
    draw(): void {
      p5.noStroke()
      p5.fill(100, 200, 100)
      p5.rect(760, 120, 230, 40)
      p5.fill(0)
      p5.text('Do 1 gen ASAP.', 770, 150)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(760, 120, 230, 40)
    }

    onClick(): void {
      gensToDo = 1
      startASAP()
    }
  }

  class SimulateAlapButton extends Widget {
    draw(): void {
      p5.noStroke()

      if (gensToDo >= 2) {
        p5.fill(128, 255, 128)
      } else {
        p5.fill(70, 140, 70)
      }

      p5.rect(990, 120, 230, 40)
      p5.fill(0)
      p5.text('Do gens ALAP.', 1000, 150)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(990, 120, 230, 40)
    }

    onClick(): void {
      gensToDo = 1000000000
      startASAP()
    }
  }

  class StepByStepSkipButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(0, windowHeight - 40, 90, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('SKIP', 45, windowHeight - 8)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(0, windowHeight - 40, 90, 40)
    }

    onClick(): void {
      for (let s = timer; s < 900; s++) {
        simulate()
      }

      timer = 1021
    }
  }

  class StepByStepPlaybackSpeedButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(120, windowHeight - 40, 240, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('PB speed: x' + speed, 240, windowHeight - 8)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(120, windowHeight - 40, 240, 40)
    }

    onClick(): void {
      speed *= 2

      if (speed === 1024) {
        speed = 900
      }

      if (speed >= 1800) {
        speed = 1
      }
    }
  }

  class StepByStepFinishButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(windowWidth - 120, windowHeight - 40, 120, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('FINISH', windowWidth - 60, windowHeight - 8)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(windowWidth - 120, windowHeight - 40, 120, 40)
    }

    onClick(): void {
      for (let s = timer; s < 900; s++) {
        simulate()
      }

      timer = 0
      creaturesTested++

      for (let i = creaturesTested; i < CREATURE_COUNT; i++) {
        setGlobalVariables(c[i])

        for (let s = 0; s < 900; s++) {
          simulate()
        }

        setAverages()
        setFitness(i)
      }

      setActivity(Activity.SimulationFinished)
    }
  }

  class SortCreaturesButton extends Widget {
    draw(): void {
      screenImage.noStroke()
      screenImage.fill(100, 100, 200)
      screenImage.rect(900, 664, 260, 40)
      screenImage.fill(0)
      screenImage.textAlign(p5.CENTER)
      screenImage.textFont(font, 24)
      screenImage.text('Sort', windowWidth - 250, 690)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(900, 664, 260, 40)
    }

    onClick(): void {
      setActivity(Activity.SortingCreatures)
    }
  }

  class SortingCreaturesSkipButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(0, windowHeight - 40, 90, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('SKIP', 45, windowHeight - 8)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(0, windowHeight - 40, 90, 40)
    }

    onClick(): void {
      timer = 100000
    }
  }

  class CullCreaturesButton extends Widget {
    draw(): void {
      screenImage.noStroke()
      screenImage.fill(100, 100, 200)
      screenImage.rect(900, 670, 260, 40)
      screenImage.fill(0)
      screenImage.textAlign(p5.CENTER)
      screenImage.textFont(font, 24)
      screenImage.text(
        `Kill ${Math.floor(CREATURE_COUNT / 2)}`,
        windowWidth - 250,
        700
      )
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(900, 670, 260, 40)
    }

    onClick(): void {
      setActivity(Activity.CullingCreatures)
    }
  }

  class PropagateCreaturesButton extends Widget {
    draw(): void {
      screenImage.noStroke()
      screenImage.fill(100, 100, 200)
      screenImage.rect(1050, 670, 160, 40)
      screenImage.fill(0)
      screenImage.textAlign(p5.CENTER)
      screenImage.textFont(font, 24)
      screenImage.text('Reproduce', windowWidth - 150, 700)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      setActivity(Activity.PropagatingCreatures)
    }
  }

  class PropagatedCreaturesBackButton extends Widget {
    draw(): void {
      screenImage.noStroke()
      screenImage.fill(100, 100, 200)
      screenImage.rect(1050, 670, 160, 40)
      screenImage.fill(0)
      screenImage.textAlign(p5.CENTER)
      screenImage.textFont(font, 24)
      screenImage.text('Back', windowWidth - 150, 700)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(1050, 670, 160, 40)
    }

    onClick(): void {
      setActivity(Activity.GenerationView)
    }
  }

  class GenerationSlider extends Widget {
    draw(): void {
      p5.noStroke()
      p5.textAlign(p5.CENTER)
      p5.fill(100)
      p5.rect(760, 340, 460, 50)
      p5.fill(220)
      p5.rect(sliderX, 340, 50, 50)

      let fs = 0
      if (selectedGeneration >= 1) {
        fs = p5.floor(p5.log(selectedGeneration) / p5.log(10))
      }

      const fontSize = fontSizes[fs]

      p5.textFont(font, fontSize)
      p5.fill(0)
      p5.text(selectedGeneration, sliderX + 25, 366 + fontSize * 0.3333)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(sliderX, 340, 50, 50)
    }

    onDrag(): void {
      const {mX} = getCursorPosition()
      sliderX = p5.min(p5.max(sliderX + (mX - 25 - sliderX) * 0.2, 760), 1170)
    }
  }

  class StatusWindowView extends Widget {
    draw(): void {
      let x, y, px, py
      let rank = statusWindow + 1

      let cj

      p5.stroke(p5.abs((overallTimer % 30) - 15) * 17)
      p5.strokeWeight(3)
      p5.noFill()

      if (statusWindow >= 0) {
        cj = c2[statusWindow]

        if (activity === Activity.FinishedStepByStep) {
          const id = (cj.id - 1) % CREATURE_COUNT
          x = id % 40
          y = p5.floor(id / 40)
        } else {
          x = statusWindow % 40
          y = p5.floor(statusWindow / 40) + 1
        }

        px = x * 30 + 55
        py = y * 25 + 10

        if (px <= 1140) {
          px += 80
        } else {
          px -= 80
        }

        p5.rect(x * 30 + 40, y * 25 + 17, 30, 25)
      } else {
        cj = creatureDatabase[(selectedGeneration - 1) * 3 + statusWindow + 3]
        x = 760 + (statusWindow + 3) * 160
        y = 180
        px = x
        py = y
        p5.rect(x, y, 140, 140)

        const ranks = [CREATURE_COUNT, Math.floor(CREATURE_COUNT / 2), 1]
        rank = ranks[statusWindow + 3]
      }

      p5.noStroke()
      p5.fill(255)
      p5.rect(px - 60, py, 120, 52)
      p5.fill(0)
      p5.textFont(font, 12)
      p5.textAlign(p5.CENTER)
      p5.text('#' + rank, px, py + 12)
      p5.text('ID: ' + cj.id, px, py + 24)
      p5.text('Fitness: ' + p5.nf(cj.d, 0, 3), px, py + 36)
      p5.colorMode(p5.HSB, 1)

      const sp = (cj.n.length % 10) * 10 + (cj.m.length % 10)
      p5.fill(getColor(sp, true))
      p5.text(
        'Species: S' + (cj.n.length % 10) + '' + (cj.m.length % 10),
        px,
        py + 48
      )
      p5.colorMode(p5.RGB, 255)

      if (showPopupSimulation) {
        this.drawPopupSimulation(px, py)
      }
    }

    private drawPopupSimulation(px: number, py: number): void {
      let py2 = py - 125
      if (py >= 360) {
        py2 -= 180
      } else {
        py2 += 180
      }

      const px2 = p5.min(p5.max(px - 90, 10), 970)

      drawpopUpImage()
      p5.image(popUpImage, px2, py2, 300, 300)

      drawStats(px2 + 295, py2, 0.45)
      simulate()
    }
  }

  const startViewStartButton = new StartViewStartButton()
  const generationViewCreateButton = new GenerationViewCreateButton()
  const generatedCreaturesBackButton = new GeneratedCreaturesBackButton()
  const simulateStepByStepButton = new SimulateStepByStepButton()
  const simulateQuickButton = new SimulateQuickButton()
  const simulateAsapButton = new SimulateAsapButton()
  const simulateAlapButton = new SimulateAlapButton()
  const generationSlider = new GenerationSlider()
  const stepByStepSkipButton = new StepByStepSkipButton()
  const stepByStepPlaybackSpeedButton = new StepByStepPlaybackSpeedButton()
  const stepByStepFinishButton = new StepByStepFinishButton()
  const sortCreaturesButton = new SortCreaturesButton()
  const sortingCreaturesSkipButton = new SortingCreaturesSkipButton()
  const cullCreaturesButton = new CullCreaturesButton()
  const propagateCreaturesButton = new PropagateCreaturesButton()
  const propagatedCreaturesBackButton = new PropagatedCreaturesBackButton()
  const statusWindowView = new StatusWindowView()

  class Node {
    // FLOAT
    x: number
    y: number
    vx: number
    vy: number
    prevX: number
    prevY: number
    pvx: number
    pvy: number
    m: number
    f: number
    value: number
    valueToBe: number
    pressure: number

    // INT
    operation: number
    axon1: number
    axon2: number

    safeInput: boolean

    constructor(
      tx: number,
      ty: number,
      tvx: number,
      tvy: number,
      tm: number,
      tf: number,
      val: number,
      op: number,
      a1: number,
      a2: number
    ) {
      this.prevX = this.x = tx
      this.prevY = this.y = ty
      this.pvx = this.vx = tvx
      this.pvy = this.vy = tvy

      this.m = tm
      this.f = tf

      this.value = this.valueToBe = val
      this.operation = op
      this.axon1 = a1
      this.axon2 = a2
      this.pressure = 0

      this.safeInput = false
    }

    applyForces(): void {
      this.vx *= airFriction
      this.vy *= airFriction
      this.y += this.vy
      this.x += this.vx
      const acc = p5.dist(this.vx, this.vy, this.pvx, this.pvy)
      totalNodeNausea += acc * acc * nauseaUnit
      this.pvx = this.vx
      this.pvy = this.vy
    }

    applyGravity(): void {
      this.vy += gravity
    }

    pressAgainstGround(groundY: number): void {
      const dif = this.y - (groundY - this.m / 2)
      this.pressure += dif * pressureUnit
      this.y = groundY - this.m / 2
      this.vy = 0
      this.x -= this.vx * this.f

      if (this.vx > 0) {
        this.vx -= this.f * dif * FRICTION
        if (this.vx < 0) {
          this.vx = 0
        }
      } else {
        this.vx += this.f * dif * FRICTION
        if (this.vx > 0) {
          this.vx = 0
        }
      }
    }

    hitWalls(): void {
      this.pressure = 0
      let dif = this.y + this.m / 2

      if (dif >= 0 && haveGround) {
        this.pressAgainstGround(0)
      }

      if (this.y > this.prevY && hazelStairs >= 0) {
        const bottomPointNow = this.y + this.m / 2
        const bottomPointPrev = this.prevY + this.m / 2
        const levelNow = p5.int(p5.ceil(bottomPointNow / hazelStairs))
        const levelPrev = p5.int(p5.ceil(bottomPointPrev / hazelStairs))

        if (levelNow > levelPrev) {
          const groundLevel = levelPrev * hazelStairs
          this.pressAgainstGround(groundLevel)
        }
      }

      for (let i = 0; i < rects.length; i++) {
        const r = rects[i]
        let flip = false
        let px, py

        if (
          p5.abs(this.x - (r.x1 + r.x2) / 2) <= (r.x2 - r.x1 + this.m) / 2 &&
          p5.abs(this.y - (r.y1 + r.y2) / 2) <= (r.y2 - r.y1 + this.m) / 2
        ) {
          if (
            this.x >= r.x1 &&
            this.x < r.x2 &&
            this.y >= r.y1 &&
            this.y < r.y2
          ) {
            const d1 = this.x - r.x1
            const d2 = r.x2 - this.x
            const d3 = this.y - r.y1
            const d4 = r.y2 - this.y

            if (d1 < d2 && d1 < d3 && d1 < d4) {
              px = r.x1
              py = this.y
            } else if (d2 < d3 && d2 < d4) {
              px = r.x2
              py = this.y
            } else if (d3 < d4) {
              px = this.x
              py = r.y1
            } else {
              px = this.x
              py = r.y2
            }

            flip = true
          } else {
            if (this.x < r.x1) {
              px = r.x1
            } else if (this.x < r.x2) {
              px = this.x
            } else {
              px = r.x2
            }

            if (this.y < r.y1) {
              py = r.y1
            } else if (this.y < r.y2) {
              py = this.y
            } else {
              py = r.y2
            }
          }

          const distance = p5.dist(this.x, this.y, px, py)
          let rad = this.m / 2
          let wallAngle = p5.atan2(py - this.y, px - this.x)

          if (flip) {
            wallAngle += p5.PI
          }

          if (distance < rad || flip) {
            dif = rad - distance

            this.pressure += dif * pressureUnit
            let multi = rad / distance

            if (flip) {
              multi = -multi
            }

            this.x = (this.x - px) * multi + px
            this.y = (this.y - py) * multi + py

            const veloAngle = p5.atan2(this.vy, this.vx)
            const veloMag = p5.dist(0, 0, this.vx, this.vy)
            const relAngle = veloAngle - wallAngle
            const relY = p5.sin(relAngle) * veloMag * dif * FRICTION

            this.vx = -p5.sin(relAngle) * relY
            this.vy = p5.cos(relAngle) * relY
          }
        }
      }

      this.prevY = this.y
      this.prevX = this.x
    }

    doMath(i: number, n: Node[]): void {
      const axonValue1 = n[this.axon1].value
      const axonValue2 = n[this.axon2].value

      if (this.operation == 0) {
        // constant
      } else if (this.operation == 1) {
        // time
        this.valueToBe = simulationTimer / 60.0
      } else if (this.operation == 2) {
        // x - coordinate
        this.valueToBe = this.x * 0.2
      } else if (this.operation == 3) {
        // this.y - coordinate
        this.valueToBe = -this.y * 0.2
      } else if (this.operation == 4) {
        // plus
        this.valueToBe = axonValue1 + axonValue2
      } else if (this.operation == 5) {
        // minus
        this.valueToBe = axonValue1 - axonValue2
      } else if (this.operation == 6) {
        // times
        this.valueToBe = axonValue1 * axonValue2
      } else if (this.operation == 7) {
        // divide
        this.valueToBe = axonValue2 === 0 ? 0 : axonValue1 / axonValue2
      } else if (this.operation == 8) {
        // modulus
        this.valueToBe = axonValue2 === 0 ? 0 : axonValue1 % axonValue2
      } else if (this.operation == 9) {
        // sin
        this.valueToBe = p5.sin(axonValue1)
      } else if (this.operation == 10) {
        // sig
        this.valueToBe = 1 / (1 + p5.pow(2.71828182846, -axonValue1))
      } else if (this.operation == 11) {
        // pressure
        this.valueToBe = this.pressure
      }
    }

    realizeMathValues(i: number): void {
      this.value = this.valueToBe
    }

    copyNode(): Node {
      return new Node(
        this.x,
        this.y,
        0,
        0,
        this.m,
        this.f,
        this.value,
        this.operation,
        this.axon1,
        this.axon2
      )
    }

    modifyNode(mutability: number, nodeNum: number): Node {
      const newX = this.x + r() * 0.5 * mutability
      const newY = this.y + r() * 0.5 * mutability
      let newM = this.m + r() * 0.1 * mutability

      newM = p5.min(p5.max(newM, 0.3), 0.5)
      newM = 0.4

      let newV = this.value * (1 + r() * 0.2 * mutability)
      let newOperation = this.operation
      let newAxon1 = this.axon1
      let newAxon2 = this.axon2

      if (p5.random(0, 1) < bigMutationChance * mutability) {
        newOperation = p5.int(p5.random(0, operationCount))
      }
      if (p5.random(0, 1) < bigMutationChance * mutability) {
        newAxon1 = p5.int(p5.random(0, nodeNum))
      }
      if (p5.random(0, 1) < bigMutationChance * mutability) {
        newAxon2 = p5.int(p5.random(0, nodeNum))
      }

      if (newOperation == 1) {
        // time
        newV = 0
      } else if (newOperation == 2) {
        // x - coordinate
        newV = newX * 0.2
      } else if (newOperation == 3) {
        // this.y - coordinate
        newV = -newY * 0.2
      }

      return new Node(
        newX,
        newY,
        0,
        0,
        newM,
        p5.min(p5.max(this.f + r() * 0.1 * mutability, 0), 1),
        newV,
        newOperation,
        newAxon1,
        newAxon2
      )
    }
  }

  class Muscle {
    axon: number
    c1: number
    c2: number
    len: number
    rigidity: number
    previousTarget: number

    constructor(
      taxon: number,
      tc1: number,
      tc2: number,
      tlen: number,
      trigidity: number
    ) {
      this.axon = taxon
      this.previousTarget = this.len = tlen
      this.c1 = tc1
      this.c2 = tc2
      this.rigidity = trigidity
    }

    applyForce(i: number, n: Node[]): void {
      let target = this.previousTarget

      if (energyDirection == 1 || energy >= 0.0001) {
        if (this.axon >= 0 && this.axon < n.length) {
          target = this.len * toMuscleUsable(n[this.axon].value)
        } else {
          target = this.len
        }
      }

      const ni1 = n[this.c1]
      const ni2 = n[this.c2]

      const distance = p5.dist(ni1.x, ni1.y, ni2.x, ni2.y)
      const angle = p5.atan2(ni1.y - ni2.y, ni1.x - ni2.x)

      const force = p5.min(p5.max(1 - distance / target, -0.4), 0.4)
      ni1.vx += (p5.cos(angle) * force * this.rigidity) / ni1.m
      ni1.vy += (p5.sin(angle) * force * this.rigidity) / ni1.m
      ni2.vx -= (p5.cos(angle) * force * this.rigidity) / ni2.m
      ni2.vy -= (p5.sin(angle) * force * this.rigidity) / ni2.m

      energy = p5.max(
        energy +
          energyDirection *
            p5.abs(this.previousTarget - target) *
            this.rigidity *
            energyUnit,
        0
      )

      this.previousTarget = target
    }

    copyMuscle(): Muscle {
      return new Muscle(this.axon, this.c1, this.c2, this.len, this.rigidity)
    }

    modifyMuscle(nodeNum: number, mutability: number): Muscle {
      let newc1 = this.c1
      let newc2 = this.c2
      let newAxon = this.axon

      if (p5.random(0, 1) < bigMutationChance * mutability) {
        newc1 = p5.int(p5.random(0, nodeNum))
      }

      if (p5.random(0, 1) < bigMutationChance * mutability) {
        newc2 = p5.int(p5.random(0, nodeNum))
      }

      if (p5.random(0, 1) < bigMutationChance * mutability) {
        newAxon = getNewMuscleAxon(nodeNum)
      }

      const newR = p5.min(
        p5.max(this.rigidity * (1 + r() * 0.9 * mutability), 0.01),
        0.08
      )
      const newLen = p5.min(p5.max(this.len + r() * mutability, 0.4), 1.25)

      return new Muscle(newAxon, newc1, newc2, newLen, newR)
    }
  }

  function getNewMuscleAxon(nodeNum: number): number {
    if (p5.random(0, 1) < 0.5) {
      return p5.int(p5.random(0, nodeNum))
    } else {
      return -1
    }
  }

  class Creature {
    n: Node[]
    m: Array<Muscle>
    d: number
    id: number
    alive: boolean
    creatureTimer: number
    mutability: number

    constructor(
      tid: number,
      tn: Node[],
      tm: Array<Muscle>,
      td: number,
      talive: boolean,
      tct: number,
      tmut: number
    ) {
      this.id = tid
      this.m = tm
      this.n = tn
      this.d = td
      this.alive = talive
      this.creatureTimer = tct
      this.mutability = tmut
    }

    modified(id: number): Creature {
      const modifiedCreature = new Creature(
        id,
        [],
        [],
        0,
        true,
        this.creatureTimer + r() * 16 * this.mutability,
        p5.min(this.mutability * p5.random(0.8, 1.25), 2)
      )

      for (let i = 0; i < this.n.length; i++) {
        modifiedCreature.n.push(
          this.n[i].modifyNode(this.mutability, this.n.length)
        )
      }

      for (let i = 0; i < this.m.length; i++) {
        modifiedCreature.m.push(
          this.m[i].modifyMuscle(this.n.length, this.mutability)
        )
      }

      if (
        p5.random(0, 1) < bigMutationChance * this.mutability ||
        this.n.length <= 2
      ) {
        // Add a node
        modifiedCreature.addRandomNode()
      }

      if (p5.random(0, 1) < bigMutationChance * this.mutability) {
        // Add a muscle
        modifiedCreature.addRandomMuscle(-1, -1)
      }

      if (
        p5.random(0, 1) < bigMutationChance * this.mutability &&
        modifiedCreature.n.length >= 4
      ) {
        // Remove a node
        modifiedCreature.removeRandomNode()
      }

      if (
        p5.random(0, 1) < bigMutationChance * this.mutability &&
        modifiedCreature.m.length >= 2
      ) {
        // Remove a muscle
        modifiedCreature.removeRandomMuscle()
      }

      modifiedCreature.checkForOverlap()
      modifiedCreature.checkForLoneNodes()
      modifiedCreature.checkForBadAxons()

      return modifiedCreature
    }

    checkForOverlap(): void {
      const bads = new Array<number>()

      for (let i = 0; i < this.m.length; i++) {
        for (let j = i + 1; j < this.m.length; j++) {
          if (this.m[i].c1 == this.m[j].c1 && this.m[i].c2 == this.m[j].c2) {
            bads.push(i)
          } else if (
            this.m[i].c1 == this.m[j].c2 &&
            this.m[i].c2 == this.m[j].c1
          ) {
            bads.push(i)
          } else if (this.m[i].c1 == this.m[i].c2) {
            bads.push(i)
          }
        }
      }

      for (let i = bads.length - 1; i >= 0; i--) {
        const b = bads[i] + 0

        if (b < this.m.length) {
          this.m.splice(b, 1)
        }
      }
    }

    checkForLoneNodes(): void {
      if (this.n.length >= 3) {
        for (let i = 0; i < this.n.length; i++) {
          let connections = 0
          let connectedTo = -1

          for (let j = 0; j < this.m.length; j++) {
            if (this.m[j].c1 == i || this.m[j].c2 == i) {
              connections++
              connectedTo = j
            }
          }

          if (connections <= 1) {
            let newConnectionNode = p5.floor(p5.random(0, this.n.length))

            while (newConnectionNode == i || newConnectionNode == connectedTo) {
              newConnectionNode = p5.floor(p5.random(0, this.n.length))
            }

            this.addRandomMuscle(i, newConnectionNode)
          }
        }
      }
    }

    checkForBadAxons(): void {
      for (let i = 0; i < this.n.length; i++) {
        const ni = this.n[i]

        if (ni.axon1 >= this.n.length) {
          ni.axon1 = p5.int(p5.random(0, this.n.length))
        }

        if (ni.axon2 >= this.n.length) {
          ni.axon2 = p5.int(p5.random(0, this.n.length))
        }
      }

      for (let i = 0; i < this.m.length; i++) {
        const mi = this.m[i]

        if (mi.axon >= this.n.length) {
          mi.axon = getNewMuscleAxon(this.n.length)
        }
      }

      for (let i = 0; i < this.n.length; i++) {
        const ni = this.n[i]
        ni.safeInput = operationAxons[ni.operation] == 0
      }

      let iterations = 0
      let didSomething = false

      while (iterations < 1000) {
        didSomething = false

        for (let i = 0; i < this.n.length; i++) {
          const ni = this.n[i]

          if (!ni.safeInput) {
            if (
              (operationAxons[ni.operation] == 1 &&
                this.n[ni.axon1].safeInput) ||
              (operationAxons[ni.operation] == 2 &&
                this.n[ni.axon1].safeInput &&
                this.n[ni.axon2].safeInput)
            ) {
              ni.safeInput = true
              didSomething = true
            }
          }
        }

        if (!didSomething) {
          iterations = 10000
        }
      }

      for (let i = 0; i < this.n.length; i++) {
        const ni = this.n[i]

        if (!ni.safeInput) {
          // This node doesn't get its input from a safe place.  CLEANSE IT.
          ni.operation = 0
          ni.value = p5.random(0, 1)
        }
      }
    }

    addRandomNode(): void {
      const parentNode = p5.floor(p5.random(0, this.n.length))
      const ang1 = p5.random(0, 2 * p5.PI)
      const distance = p5.sqrt(p5.random(0, 1))
      const x = this.n[parentNode].x + p5.cos(ang1) * 0.5 * distance
      const y = this.n[parentNode].y + p5.sin(ang1) * 0.5 * distance

      const newNodeCount = this.n.length + 1

      this.n.push(
        new Node(
          x,
          y,
          0,
          0,
          0.4,
          p5.random(0, 1),
          p5.random(0, 1),
          p5.floor(p5.random(0, operationCount)),
          p5.floor(p5.random(0, newNodeCount)),
          p5.floor(p5.random(0, newNodeCount))
        )
      )

      let nextClosestNode = 0
      let record = 100000

      for (let i = 0; i < this.n.length - 1; i++) {
        if (i != parentNode) {
          const dx = this.n[i].x - x
          const dy = this.n[i].y - y

          if (p5.sqrt(dx * dx + dy * dy) < record) {
            record = p5.sqrt(dx * dx + dy * dy)
            nextClosestNode = i
          }
        }
      }

      this.addRandomMuscle(parentNode, this.n.length - 1)
      this.addRandomMuscle(nextClosestNode, this.n.length - 1)
    }

    addRandomMuscle(tc1: number, tc2: number): void {
      const axon = getNewMuscleAxon(this.n.length)

      if (tc1 == -1) {
        tc1 = p5.int(p5.random(0, this.n.length))
        tc2 = tc1

        while (tc2 == tc1 && this.n.length >= 2) {
          tc2 = p5.int(p5.random(0, this.n.length))
        }
      }

      let len = p5.random(0.5, 1.5)

      if (tc1 != -1) {
        len = p5.dist(
          this.n[tc1].x,
          this.n[tc1].y,
          this.n[tc2].x,
          this.n[tc2].y
        )
      }

      this.m.push(new Muscle(axon, tc1, tc2, len, p5.random(0.02, 0.08)))
    }

    removeRandomNode(): void {
      const choice = p5.floor(p5.random(0, this.n.length))
      this.n.splice(choice, 1)

      let i = 0

      while (i < this.m.length) {
        if (this.m[i].c1 == choice || this.m[i].c2 == choice) {
          this.m.splice(i, 1)
        } else {
          i++
        }
      }

      for (let j = 0; j < this.m.length; j++) {
        if (this.m[j].c1 >= choice) {
          this.m[j].c1--
        }

        if (this.m[j].c2 >= choice) {
          this.m[j].c2--
        }
      }
    }

    removeRandomMuscle(): void {
      const choice = p5.floor(p5.random(0, this.m.length))
      this.m.splice(choice, 1)
    }

    copyCreature(newID: number): Creature {
      const n2 = []
      const m2 = []

      for (let i = 0; i < this.n.length; i++) {
        n2.push(this.n[i].copyNode())
      }

      for (let i = 0; i < this.m.length; i++) {
        m2.push(this.m[i].copyMuscle())
      }

      if (newID == -1) {
        newID = this.id
      }

      return new Creature(
        newID,
        n2,
        m2,
        this.d,
        this.alive,
        this.creatureTimer,
        this.mutability
      )
    }
  }

  function drawGround(toImage: number): void {
    const stairDrawStart = p5.max(1, p5.int(-averageY / hazelStairs) - 10)

    if (toImage == 0) {
      p5.noStroke()
      p5.fill(0, 130, 0)

      if (haveGround) {
        p5.rect(
          (camX - camZoom * 800.0) * scaleToFixBug,
          0 * scaleToFixBug,
          camZoom * 1600.0 * scaleToFixBug,
          camZoom * 900.0 * scaleToFixBug
        )
      }

      for (let i = 0; i < rects.length; i++) {
        const r = rects[i]

        p5.rect(
          r.x1 * scaleToFixBug,
          r.y1 * scaleToFixBug,
          (r.x2 - r.x1) * scaleToFixBug,
          (r.y2 - r.y1) * scaleToFixBug
        )
      }

      if (hazelStairs > 0) {
        for (let i = stairDrawStart; i < stairDrawStart + 20; i++) {
          p5.fill(255, 255, 255, 128)
          p5.rect(
            (averageX - 20) * scaleToFixBug,
            -hazelStairs * i * scaleToFixBug,
            40 * scaleToFixBug,
            hazelStairs * 0.3 * scaleToFixBug
          )
          p5.fill(255, 255, 255, 255)
          p5.rect(
            (averageX - 20) * scaleToFixBug,
            -hazelStairs * i * scaleToFixBug,
            40 * scaleToFixBug,
            hazelStairs * 0.15 * scaleToFixBug
          )
        }
      }
    } else if (toImage == 2) {
      popUpImage.noStroke()
      popUpImage.fill(0, 130, 0)

      if (haveGround) {
        popUpImage.rect(
          (camX - camZoom * 300.0) * scaleToFixBug,
          0 * scaleToFixBug,
          camZoom * 600.0 * scaleToFixBug,
          camZoom * 600.0 * scaleToFixBug
        )
      }

      for (let i = 0; i < rects.length; i++) {
        const r = rects[i]

        popUpImage.rect(
          r.x1 * scaleToFixBug,
          r.y1 * scaleToFixBug,
          (r.x2 - r.x1) * scaleToFixBug,
          (r.y2 - r.y1) * scaleToFixBug
        )
      }

      if (hazelStairs > 0) {
        for (let i = stairDrawStart; i < stairDrawStart + 20; i++) {
          popUpImage.fill(255, 255, 255, 128)
          popUpImage.rect(
            (averageX - 20) * scaleToFixBug,
            -hazelStairs * i * scaleToFixBug,
            40 * scaleToFixBug,
            hazelStairs * 0.3 * scaleToFixBug
          )
          popUpImage.fill(255, 255, 255, 255)
          popUpImage.rect(
            (averageX - 20) * scaleToFixBug,
            -hazelStairs * i * scaleToFixBug,
            40 * scaleToFixBug,
            hazelStairs * 0.15 * scaleToFixBug
          )
        }
      }
    }
  }

  function drawNode(ni: Node, x: number, y: number, toImage: number): void {
    let c = p5.color(512 - p5.int(ni.f * 512), 0, 0)

    if (ni.f <= 0.5) {
      c = p5.color(255, 255 - p5.int(ni.f * 512), 255 - p5.int(ni.f * 512))
    }

    if (toImage == 0) {
      p5.fill(c)
      p5.noStroke()
      p5.ellipse(
        (ni.x + x) * scaleToFixBug,
        (ni.y + y) * scaleToFixBug,
        ni.m * scaleToFixBug,
        ni.m * scaleToFixBug
      )

      if (ni.f >= 0.5) {
        p5.fill(255)
      } else {
        p5.fill(0)
      }

      p5.textAlign(p5.CENTER)
      p5.textFont(font, 0.4 * ni.m * scaleToFixBug)
      p5.text(
        p5.nf(ni.value, 0, 2),
        (ni.x + x) * scaleToFixBug,
        (ni.y + ni.m * lineY2 + y) * scaleToFixBug
      )
      p5.text(
        operationNames[ni.operation],
        (ni.x + x) * scaleToFixBug,
        (ni.y + ni.m * lineY1 + y) * scaleToFixBug
      )
    } else if (toImage == 1) {
      screenImage.fill(c)
      screenImage.noStroke()
      screenImage.ellipse(
        (ni.x + x) * scaleToFixBug,
        (ni.y + y) * scaleToFixBug,
        ni.m * scaleToFixBug,
        ni.m * scaleToFixBug
      )

      if (ni.f >= 0.5) {
        screenImage.fill(255)
      } else {
        screenImage.fill(0)
      }

      screenImage.textAlign(p5.CENTER)
      screenImage.textFont(font, 0.4 * ni.m * scaleToFixBug)
      screenImage.text(
        p5.nf(ni.value, 0, 2),
        (ni.x + x) * scaleToFixBug,
        (ni.y + ni.m * lineY2 + y) * scaleToFixBug
      )
      screenImage.text(
        operationNames[ni.operation],
        (ni.x + x) * scaleToFixBug,
        (ni.y + ni.m * lineY1 + y) * scaleToFixBug
      )
    } else if (toImage == 2) {
      popUpImage.fill(c)
      popUpImage.noStroke()
      popUpImage.ellipse(
        (ni.x + x) * scaleToFixBug,
        (ni.y + y) * scaleToFixBug,
        ni.m * scaleToFixBug,
        ni.m * scaleToFixBug
      )

      if (ni.f >= 0.5) {
        popUpImage.fill(255)
      } else {
        popUpImage.fill(0)
      }

      popUpImage.textAlign(p5.CENTER)
      popUpImage.textFont(font, 0.4 * ni.m * scaleToFixBug)
      popUpImage.text(
        p5.nf(ni.value, 0, 2),
        (ni.x + x) * scaleToFixBug,
        (ni.y + ni.m * lineY2 + y) * scaleToFixBug
      )
      popUpImage.text(
        operationNames[ni.operation],
        (ni.x + x) * scaleToFixBug,
        (ni.y + ni.m * lineY1 + y) * scaleToFixBug
      )
    }
  }

  function drawNodeAxons(
    n: Node[],
    i: number,
    x: number,
    y: number,
    toImage: number
  ): void {
    const ni = n[i]

    if (operationAxons[ni.operation] >= 1) {
      const axonSource = n[n[i].axon1]
      const point1x = ni.x - ni.m * 0.3 + x
      const point1y = ni.y - ni.m * 0.3 + y
      const point2x = axonSource.x + x
      const point2y = axonSource.y + axonSource.m * 0.5 + y

      drawSingleAxon(point1x, point1y, point2x, point2y, toImage)
    }

    if (operationAxons[ni.operation] == 2) {
      const axonSource = n[n[i].axon2]
      const point1x = ni.x + ni.m * 0.3 + x
      const point1y = ni.y - ni.m * 0.3 + y
      const point2x = axonSource.x + x
      const point2y = axonSource.y + axonSource.m * 0.5 + y

      drawSingleAxon(point1x, point1y, point2x, point2y, toImage)
    }
  }

  function drawSingleAxon(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    toImage: number
  ): void {
    const arrowHeadSize = 0.1
    const angle = p5.atan2(y2 - y1, x2 - x1)

    if (toImage == 0) {
      p5.stroke(axonColor)
      p5.strokeWeight(0.03 * scaleToFixBug)
      p5.line(
        x1 * scaleToFixBug,
        y1 * scaleToFixBug,
        x2 * scaleToFixBug,
        y2 * scaleToFixBug
      )
      p5.line(
        x1 * scaleToFixBug,
        y1 * scaleToFixBug,
        (x1 + p5.cos(angle + p5.PI * 0.25) * arrowHeadSize) * scaleToFixBug,
        (y1 + p5.sin(angle + p5.PI * 0.25) * arrowHeadSize) * scaleToFixBug
      )
      p5.line(
        x1 * scaleToFixBug,
        y1 * scaleToFixBug,
        (x1 + p5.cos(angle + p5.PI * 1.75) * arrowHeadSize) * scaleToFixBug,
        (y1 + p5.sin(angle + p5.PI * 1.75) * arrowHeadSize) * scaleToFixBug
      )
      p5.noStroke()
    } else if (toImage == 1) {
      screenImage.stroke(axonColor)
      screenImage.strokeWeight(0.03 * scaleToFixBug)
      screenImage.line(
        x1 * scaleToFixBug,
        y1 * scaleToFixBug,
        x2 * scaleToFixBug,
        y2 * scaleToFixBug
      )
      screenImage.line(
        x1 * scaleToFixBug,
        y1 * scaleToFixBug,
        (x1 + p5.cos(angle + p5.PI * 0.25) * arrowHeadSize) * scaleToFixBug,
        (y1 + p5.sin(angle + p5.PI * 0.25) * arrowHeadSize) * scaleToFixBug
      )
      screenImage.line(
        x1 * scaleToFixBug,
        y1 * scaleToFixBug,
        (x1 + p5.cos(angle + p5.PI * 1.75) * arrowHeadSize) * scaleToFixBug,
        (y1 + p5.sin(angle + p5.PI * 1.75) * arrowHeadSize) * scaleToFixBug
      )
      popUpImage.noStroke()
    } else if (toImage == 2) {
      popUpImage.stroke(axonColor)
      popUpImage.strokeWeight(0.03 * scaleToFixBug)
      popUpImage.line(
        x1 * scaleToFixBug,
        y1 * scaleToFixBug,
        x2 * scaleToFixBug,
        y2 * scaleToFixBug
      )
      popUpImage.line(
        x1 * scaleToFixBug,
        y1 * scaleToFixBug,
        (x1 + p5.cos(angle + p5.PI * 0.25) * arrowHeadSize) * scaleToFixBug,
        (y1 + p5.sin(angle + p5.PI * 0.25) * arrowHeadSize) * scaleToFixBug
      )
      popUpImage.line(
        x1 * scaleToFixBug,
        y1 * scaleToFixBug,
        (x1 + p5.cos(angle + p5.PI * 1.75) * arrowHeadSize) * scaleToFixBug,
        (y1 + p5.sin(angle + p5.PI * 1.75) * arrowHeadSize) * scaleToFixBug
      )
      popUpImage.noStroke()
    }
  }

  function drawMuscle(
    mi: Muscle,
    n: Node[],
    x: number,
    y: number,
    toImage: number
  ): void {
    const ni1 = n[mi.c1]
    const ni2 = n[mi.c2]

    let w = 0.15

    if (mi.axon >= 0 && mi.axon < n.length) {
      w = toMuscleUsable(n[mi.axon].value) * 0.15
    }

    if (toImage == 0) {
      p5.strokeWeight(w * scaleToFixBug)
      p5.stroke(70, 35, 0, mi.rigidity * 3000)
      p5.line(
        (ni1.x + x) * scaleToFixBug,
        (ni1.y + y) * scaleToFixBug,
        (ni2.x + x) * scaleToFixBug,
        (ni2.y + y) * scaleToFixBug
      )
    } else if (toImage == 1) {
      screenImage.strokeWeight(w * scaleToFixBug)
      screenImage.stroke(70, 35, 0, mi.rigidity * 3000)
      screenImage.line(
        (ni1.x + x) * scaleToFixBug,
        (ni1.y + y) * scaleToFixBug,
        (ni2.x + x) * scaleToFixBug,
        (ni2.y + y) * scaleToFixBug
      )
    } else if (toImage == 2) {
      popUpImage.strokeWeight(w * scaleToFixBug)
      popUpImage.stroke(70, 35, 0, mi.rigidity * 3000)
      popUpImage.line(
        (ni1.x + x) * scaleToFixBug,
        (ni1.y + y) * scaleToFixBug,
        (ni2.x + x) * scaleToFixBug,
        (ni2.y + y) * scaleToFixBug
      )
    }
  }

  function drawMuscleAxons(
    mi: Muscle,
    n: Node[],
    x: number,
    y: number,
    toImage: number
  ): void {
    const ni1 = n[mi.c1]
    const ni2 = n[mi.c2]

    if (mi.axon >= 0 && mi.axon < n.length) {
      const axonSource = n[mi.axon]
      const muscleMidX = (ni1.x + ni2.x) * 0.5 + x
      const muscleMidY = (ni1.y + ni2.y) * 0.5 + y

      drawSingleAxon(
        muscleMidX,
        muscleMidY,
        axonSource.x + x,
        axonSource.y + axonSource.m * 0.5 + y,
        toImage
      )

      const averageMass = (ni1.m + ni2.m) * 0.5

      if (toImage == 0) {
        p5.fill(axonColor)
        p5.textAlign(p5.CENTER)
        p5.textFont(font, 0.4 * averageMass * scaleToFixBug)
        p5.text(
          p5.nf(toMuscleUsable(n[mi.axon].value), 0, 2),
          muscleMidX * scaleToFixBug,
          muscleMidY * scaleToFixBug
        )
      } else if (toImage == 1) {
        screenImage.fill(axonColor)
        screenImage.textAlign(p5.CENTER)
        screenImage.textFont(font, 0.4 * averageMass * scaleToFixBug)
        screenImage.text(
          p5.nf(toMuscleUsable(n[mi.axon].value), 0, 2),
          muscleMidX * scaleToFixBug,
          muscleMidY * scaleToFixBug
        )
      } else if (toImage == 2) {
        popUpImage.fill(axonColor)
        popUpImage.textAlign(p5.CENTER)
        popUpImage.textFont(font, 0.4 * averageMass * scaleToFixBug)
        popUpImage.text(
          p5.nf(toMuscleUsable(n[mi.axon].value), 0, 2),
          muscleMidX * scaleToFixBug,
          muscleMidY * scaleToFixBug
        )
      }
    }
  }

  function toMuscleUsable(f: number): number {
    return p5.min(p5.max(f, 0.5), 1.5)
  }

  function drawPosts(toImage: number): void {
    const startPostY = p5.min(-8, p5.int(averageY / 4) * 4 - 4)

    if (toImage == 0) {
      p5.noStroke()
      p5.textAlign(p5.CENTER)
      p5.textFont(font, postFontSize * scaleToFixBug)

      for (let postY = startPostY; postY <= startPostY + 8; postY += 4) {
        for (
          let i = p5.int(averageX / 5 - 5);
          i <= p5.int(averageX / 5 + 5);
          i++
        ) {
          p5.fill(255)
          p5.rect(
            (i * 5.0 - 0.1) * scaleToFixBug,
            (-3.0 + postY) * scaleToFixBug,
            0.2 * scaleToFixBug,
            3.0 * scaleToFixBug
          )
          p5.rect(
            (i * 5.0 - 1) * scaleToFixBug,
            (-3.0 + postY) * scaleToFixBug,
            2.0 * scaleToFixBug,
            1.0 * scaleToFixBug
          )
          p5.fill(120)
          p5.textAlign(p5.CENTER)
          p5.text(
            i + ' m',
            i * 5.0 * scaleToFixBug,
            (-2.17 + postY) * scaleToFixBug
          )
        }
      }
    } else if (toImage == 2) {
      popUpImage.textAlign(p5.CENTER)
      popUpImage.textFont(font, postFontSize * scaleToFixBug)
      popUpImage.noStroke()

      for (let postY = startPostY; postY <= startPostY + 8; postY += 4) {
        for (
          let i = p5.int(averageX / 5 - 5);
          i <= p5.int(averageX / 5 + 5);
          i++
        ) {
          popUpImage.fill(255)
          popUpImage.rect(
            (i * 5 - 0.1) * scaleToFixBug,
            (-3.0 + postY) * scaleToFixBug,
            0.2 * scaleToFixBug,
            3 * scaleToFixBug
          )
          popUpImage.rect(
            (i * 5 - 1) * scaleToFixBug,
            (-3.0 + postY) * scaleToFixBug,
            2 * scaleToFixBug,
            1 * scaleToFixBug
          )
          popUpImage.fill(120)
          popUpImage.text(
            i + ' m',
            i * 5 * scaleToFixBug,
            (-2.17 + postY) * scaleToFixBug
          )
        }
      }
    }
  }

  function drawArrow(x: number): void {
    p5.textAlign(p5.CENTER)
    p5.textFont(font, postFontSize * scaleToFixBug)
    p5.noStroke()
    p5.fill(120, 0, 255)
    p5.rect(
      (x - 1.7) * scaleToFixBug,
      -4.8 * scaleToFixBug,
      3.4 * scaleToFixBug,
      1.1 * scaleToFixBug
    )
    p5.beginShape()
    p5.vertex(x * scaleToFixBug, -3.2 * scaleToFixBug)
    p5.vertex((x - 0.5) * scaleToFixBug, -3.7 * scaleToFixBug)
    p5.vertex((x + 0.5) * scaleToFixBug, -3.7 * scaleToFixBug)
    p5.endShape(p5.CLOSE)
    p5.fill(255)
    p5.text(
      p5.round(x * 2) / 10 + ' m',
      x * scaleToFixBug,
      -3.91 * scaleToFixBug
    )
  }

  function drawGraphImage(): void {
    p5.image(graphImage, 50, 180, 650, 380)
    p5.image(segBarImage, 50, 580, 650, 100)

    if (generationCount >= 1) {
      p5.stroke(0, 160, 0, 255)
      p5.strokeWeight(3)

      const genWidth = 590.0 / generationCount
      const lineX = 110 + selectedGeneration * genWidth

      p5.line(lineX, 180, lineX, 500 + 180)

      const s = speciesCounts[selectedGeneration]

      p5.textAlign(p5.LEFT)
      p5.textFont(font, 12)
      p5.noStroke()

      for (let i = 1; i < 101; i++) {
        const c = s[i] - s[i - 1]

        if (c >= 25) {
          const y = ((s[i] + s[i - 1]) / 2 / 1000.0) * 100 + 573

          if (i - 1 == topSpeciesCounts[selectedGeneration]) {
            p5.stroke(0)
            p5.strokeWeight(2)
          } else {
            p5.noStroke()
          }

          p5.fill(255, 255, 255)
          p5.rect(lineX + 3, y, 56, 14)
          p5.colorMode(p5.HSB, 1.0)
          p5.fill(getColor(i - 1, true))
          p5.text(
            'S' + p5.floor((i - 1) / 10) + '' + ((i - 1) % 10) + ': ' + c,
            lineX + 5,
            y + 11
          )
          p5.colorMode(p5.RGB, 255)
        }
      }

      p5.noStroke()
    }
  }

  function getColor(i: number, adjust: boolean): Color {
    p5.colorMode(p5.HSB, 1.0)

    let col = (i * 1.618034) % 1
    if (i == 46) {
      col = 0.083333
    }

    let light = 1.0
    if (p5.abs(col - 0.333) <= 0.18 && adjust) {
      light = 0.7
    }

    return p5.color(col, 1.0, light)
  }

  function drawGraph(graphWidth: number, graphHeight: number): void {
    graphImage.background(220)

    if (generationCount >= 1) {
      drawLines(
        90,
        p5.int(graphHeight * 0.05),
        graphWidth - 90,
        p5.int(graphHeight * 0.9)
      )
      drawSegBars(90, 0, graphWidth - 90, 150)
    }
  }

  function drawLines(
    x: number,
    y: number,
    graphWidth: number,
    graphHeight: number
  ): void {
    const gh = graphHeight
    const genWidth = graphWidth / generationCount
    const best = extreme(1)
    const worst = extreme(-1)
    const meterHeight = graphHeight / (best - worst)
    const zero = (best / (best - worst)) * gh
    const unit = setUnit(best, worst)

    graphImage.stroke(150)
    graphImage.strokeWeight(2)
    graphImage.fill(150)
    graphImage.textFont(font, 18)
    graphImage.textAlign(p5.RIGHT)

    for (
      let i = p5.ceil((worst - (best - worst) / 18.0) / unit) * unit;
      i < best + (best - worst) / 18.0;
      i += unit
    ) {
      const lineY = y - i * meterHeight + zero
      graphImage.line(x, lineY, graphWidth + x, lineY)
      graphImage.text(showUnit(i, unit) + ' ' + fitnessUnit, x - 5, lineY + 4)
    }

    graphImage.stroke(0)

    for (let i = 0; i < fitnessPercentileCount; i++) {
      let k

      if (i == 28) {
        k = 14
      } else if (i < 14) {
        k = i
      } else {
        k = i + 1
      }

      if (k == 14) {
        graphImage.stroke(255, 0, 0, 255)
        graphImage.strokeWeight(5)
      } else {
        p5.stroke(0)

        if (k == 0 || k == 28 || (k >= 10 && k <= 18)) {
          graphImage.strokeWeight(3)
        } else {
          graphImage.strokeWeight(1)
        }
      }

      for (let j = 0; j < generationCount; j++) {
        graphImage.line(
          x + j * genWidth,
          -fitnessPercentileHistory[j][k] * meterHeight + zero + y,
          x + (j + 1) * genWidth,
          -fitnessPercentileHistory[j + 1][k] * meterHeight + zero + y
        )
      }
    }
  }

  function drawSegBars(
    x: number,
    y: number,
    graphWidth: number,
    graphHeight: number
  ): void {
    segBarImage.noStroke()
    segBarImage.colorMode(p5.HSB, 1)
    segBarImage.background(0, 0, 0.5)

    const genWidth = graphWidth / generationCount
    const gensPerBar = p5.floor(generationCount / 500) + 1

    for (let i = 0; i < generationCount; i += gensPerBar) {
      const i2 = p5.min(i + gensPerBar, generationCount)
      const barX1 = x + i * genWidth
      const barX2 = x + i2 * genWidth

      for (let j = 0; j < 100; j++) {
        segBarImage.fill(getColor(j, false))
        segBarImage.beginShape()
        segBarImage.vertex(
          barX1,
          y + (speciesCounts[i][j] / 1000.0) * graphHeight
        )
        segBarImage.vertex(
          barX1,
          y + (speciesCounts[i][j + 1] / 1000.0) * graphHeight
        )
        segBarImage.vertex(
          barX2,
          y + (speciesCounts[i2][j + 1] / 1000.0) * graphHeight
        )
        segBarImage.vertex(
          barX2,
          y + (speciesCounts[i2][j] / 1000.0) * graphHeight
        )
        segBarImage.endShape()
      }
    }

    p5.colorMode(p5.RGB, 255)
  }

  function extreme(sign: number): number {
    let record = -sign

    for (let i = 0; i < generationCount; i++) {
      const toTest = fitnessPercentileHistory[i + 1][p5.int(14 - sign * 14)]

      if (toTest * sign > record * sign) {
        record = toTest
      }
    }

    return record
  }

  function setUnit(best: number, worst: number): number {
    const unit2 = (3 * p5.log(best - worst)) / p5.log(10) - 2

    if ((unit2 + 90) % 3 < 1) {
      return p5.pow(10, p5.floor(unit2 / 3))
    }

    if ((unit2 + 90) % 3 < 2) {
      return p5.pow(10, p5.floor((unit2 - 1) / 3)) * 2
    }

    return p5.pow(10, p5.floor((unit2 - 2) / 3)) * 5
  }

  function showUnit(i: number, unit: number): String {
    if (unit < 1) {
      return p5.nf(i, 0, 2) + ''
    }

    return p5.int(i) + ''
  }

  function quickSort(c: Array<Creature>): Array<Creature> {
    if (c.length <= 1) {
      return c
    }

    const less = new Array<Creature>()
    const more = new Array<Creature>()
    const equal = new Array<Creature>()

    const c0 = c[0]
    equal.push(c0)

    for (let i = 1; i < c.length; i++) {
      const ci = c[i]

      if (ci.d == c0.d) {
        equal.push(ci)
      } else if (ci.d < c0.d) {
        less.push(ci)
      } else {
        more.push(ci)
      }
    }

    return quickSort(more).concat(equal).concat(quickSort(less))
  }

  function toStableConfiguration(nodeNum: number, muscleNum: number): void {
    for (let j = 0; j < 200; j++) {
      for (let i = 0; i < muscleNum; i++) {
        simulationMuscles[i].applyForce(i, simulationNodes)
      }

      for (let i = 0; i < nodeNum; i++) {
        simulationNodes[i].applyForces()
      }
    }

    for (let i = 0; i < nodeNum; i++) {
      const ni = simulationNodes[i]
      ni.vx = 0
      ni.vy = 0
    }
  }

  function adjustToCenter(nodeNum: number): void {
    let avx = 0
    let lowY = -1000

    for (let i = 0; i < nodeNum; i++) {
      const ni = simulationNodes[i]
      avx += ni.x

      if (ni.y + ni.m / 2 > lowY) {
        lowY = ni.y + ni.m / 2
      }
    }

    avx /= nodeNum

    for (let i = 0; i < nodeNum; i++) {
      const ni = simulationNodes[i]
      ni.x -= avx
      ni.y -= lowY
    }
  }

  function simulate(): void {
    for (let i = 0; i < simulationMuscles.length; i++) {
      simulationMuscles[i].applyForce(i, simulationNodes)
    }

    for (let i = 0; i < simulationNodes.length; i++) {
      const ni = simulationNodes[i]
      ni.applyGravity()
      ni.applyForces()
      ni.hitWalls()
      ni.doMath(i, simulationNodes)
    }

    for (let i = 0; i < simulationNodes.length; i++) {
      simulationNodes[i].realizeMathValues(i)
    }

    averageNodeNausea = totalNodeNausea / simulationNodes.length
    simulationTimer++
    timer++
  }

  function setAverages(): void {
    averageX = 0
    averageY = 0

    for (let i = 0; i < simulationNodes.length; i++) {
      const ni = simulationNodes[i]
      averageX += ni.x
      averageY += ni.y
    }

    averageX = averageX / simulationNodes.length
    averageY = averageY / simulationNodes.length
  }

  let simulationNodes: Node[] = []
  let simulationMuscles: Muscle[] = []

  const c = new Array<Creature>(CREATURE_COUNT)

  let c2: Creature[] = []

  p5.mouseWheel = (event: WheelEvent) => {
    const delta = event.deltaX

    if (activity === Activity.SimulationRunning) {
      if (delta < 0) {
        camZoom *= 0.9090909

        if (camZoom < 0.002) {
          camZoom = 0.002
        }

        p5.textFont(font, postFontSize)
      } else if (delta > 0) {
        camZoom *= 1.1

        if (camZoom > 0.1) {
          camZoom = 0.1
        }

        p5.textFont(font, postFontSize)
      }
    }
  }

  p5.mousePressed = () => {
    if (gensToDo >= 1) {
      gensToDo = 0
    }

    if (
      activity === Activity.GenerationView &&
      generationCount >= 1 &&
      generationSlider.isUnderCursor()
    ) {
      draggingSlider = true
    }
  }

  function setActivity(m: Activity): void {
    activity = m

    if (m === Activity.GenerationView) {
      drawGraph(975, 570)
    }
  }

  function startASAP(): void {
    setActivity(Activity.RequestingSimulation)
    creaturesTested = 0
    stepbystep = false
    stepbystepslow = false
  }

  p5.mouseReleased = () => {
    draggingSlider = false
    // When the popup simulation is running, mouse clicks will stop it.
    showPopupSimulation = false

    if (activity === Activity.Start && startViewStartButton.isUnderCursor()) {
      startViewStartButton.onClick()
    } else if (
      activity === Activity.GenerationView &&
      generationCount == -1 &&
      generationViewCreateButton.isUnderCursor()
    ) {
      generationViewCreateButton.onClick()
    } else if (activity === Activity.GenerationView && generationCount >= 0) {
      if (simulateStepByStepButton.isUnderCursor()) {
        simulateStepByStepButton.onClick()
      } else if (simulateQuickButton.isUnderCursor()) {
        simulateQuickButton.onClick()
      } else if (simulateAsapButton.isUnderCursor()) {
        simulateAsapButton.onClick()
      } else if (simulateAlapButton.isUnderCursor()) {
        simulateAlapButton.onClick()
      }
    } else if (
      activity === Activity.GeneratedCreatures &&
      generatedCreaturesBackButton.isUnderCursor()
    ) {
      generatedCreaturesBackButton.onClick()
    } else if (
      activity === Activity.FinishedStepByStep &&
      sortCreaturesButton.isUnderCursor()
    ) {
      sortCreaturesButton.onClick()
    } else if (
      activity === Activity.SimulationRunning ||
      activity === Activity.RequestingSimulation
    ) {
      if (stepByStepSkipButton.isUnderCursor()) {
        stepByStepSkipButton.onClick()
      } else if (stepByStepPlaybackSpeedButton.isUnderCursor()) {
        stepByStepPlaybackSpeedButton.onClick()
      } else if (stepByStepFinishButton.isUnderCursor()) {
        stepByStepFinishButton.onClick()
      }
    } else if (
      activity === Activity.SortingCreatures &&
      sortingCreaturesSkipButton.isUnderCursor()
    ) {
      sortingCreaturesSkipButton.onClick()
    } else if (
      activity === Activity.SortedCreatures &&
      cullCreaturesButton.isUnderCursor()
    ) {
      cullCreaturesButton.onClick()
    } else if (
      activity === Activity.CulledCreatures &&
      propagateCreaturesButton.isUnderCursor()
    ) {
      propagateCreaturesButton.onClick()
    } else if (
      activity === Activity.PropagatedCreatures &&
      propagatedCreaturesBackButton.isUnderCursor()
    ) {
      propagatedCreaturesBackButton.onClick()
    }
  }

  function drawScreenImage(stage: number): void {
    screenImage.push()
    screenImage.scale(15.0 / scaleToFixBug)
    screenImage.background(220, 253, 102)
    screenImage.noStroke()

    for (let j = 0; j < CREATURE_COUNT; j++) {
      let cj = c2[j]
      if (stage == 3) {
        cj = c[cj.id - generationCount * CREATURE_COUNT - (CREATURE_COUNT + 1)]
      }

      let j2 = j
      if (stage == 0) {
        j2 = cj.id - generationCount * CREATURE_COUNT - 1
        creaturesInPosition[j2] = j
      }

      const x = j2 % 40

      let y = p5.floor(j2 / 40)
      if (stage >= 1) {
        y++
      }

      drawCreature(cj, x * 3 + 5.5, y * 2.5 + 4, 1)
    }

    timer = 0
    screenImage.pop()
    screenImage.push()
    screenImage.scale(1.5)

    screenImage.textAlign(p5.CENTER)
    screenImage.textFont(font, 24)
    screenImage.fill(100, 100, 200)
    screenImage.noStroke()

    if (stage == 0) {
      screenImage.fill(0)
      screenImage.text(
        "All 1,000 creatures have been tested.  Now let's sort them!",
        windowWidth / 2 - 200,
        690
      )
      sortCreaturesButton.draw()
    } else if (stage == 1) {
      screenImage.fill(0)
      screenImage.text('Fastest creatures at the top!', windowWidth / 2, 30)
      screenImage.text(
        'Slowest creatures at the bottom. (Going backward = slow)',
        windowWidth / 2 - 200,
        700
      )
      cullCreaturesButton.draw()
    } else if (stage == 2) {
      screenImage.fill(0)
      screenImage.text(
        'Faster creatures are more likely to survive because they can outrun their predators.  Slow creatures get eaten.',
        windowWidth / 2,
        30
      )
      screenImage.text(
        'Because of random chance, a few fast ones get eaten, while a few slow ones survive.',
        windowWidth / 2 - 130,
        700
      )
      propagateCreaturesButton.draw()

      for (let j = 0; j < CREATURE_COUNT; j++) {
        const cj = c2[j]
        const x = j % 40
        const y = p5.floor(j / 40) + 1

        if (cj.alive) {
          drawCreature(cj, x * 30 + 55, y * 25 + 40, 0)
        } else {
          screenImage.rect(x * 30 + 40, y * 25 + 17, 30, 25)
        }
      }
    } else if (stage == 3) {
      screenImage.fill(0)
      screenImage.text(
        'These are the 1000 creatures of generation #' +
          (generationCount + 2) +
          '.',
        windowWidth / 2,
        30
      )
      screenImage.text(
        'What perils will they face?  Find out next time!',
        windowWidth / 2 - 130,
        700
      )
      propagatedCreaturesBackButton.draw()
    }

    screenImage.pop()
  }

  function drawpopUpImage(): void {
    camZoom = 0.009
    setAverages()
    camX += (averageX - camX) * 0.1
    camY += (averageY - camY) * 0.1

    popUpImage.push()
    popUpImage.translate(225, 225)
    popUpImage.scale(1.0 / camZoom / scaleToFixBug)
    popUpImage.translate(-camX * scaleToFixBug, -camY * scaleToFixBug)

    if (simulationTimer < 900) {
      popUpImage.background(120, 200, 255)
    } else {
      popUpImage.background(60, 100, 128)
    }

    drawPosts(2)
    drawGround(2)
    drawCreaturePieces(simulationNodes, simulationMuscles, 0, 0, 2)
    popUpImage.noStroke()
    popUpImage.pop()
  }

  function drawCreature(
    cj: Creature,
    x: number,
    y: number,
    toImage: number
  ): void {
    drawCreaturePieces(cj.n, cj.m, x, y, toImage)
  }

  function drawCreaturePieces(
    n: Node[],
    m: Array<Muscle>,
    x: number,
    y: number,
    toImage: number
  ): void {
    for (let i = 0; i < m.length; i++) {
      drawMuscle(m[i], n, x, y, toImage)
    }
    for (let i = 0; i < n.length; i++) {
      drawNode(n[i], x, y, toImage)
    }
    for (let i = 0; i < m.length; i++) {
      drawMuscleAxons(m[i], n, x, y, toImage)
    }
    for (let i = 0; i < n.length; i++) {
      drawNodeAxons(n, i, x, y, toImage)
    }
  }

  function drawHistogram(x: number, y: number, hw: number, hh: number): void {
    let maxH = 1

    for (let i = 0; i < barLen; i++) {
      if (barCounts[selectedGeneration][i] > maxH) {
        maxH = barCounts[selectedGeneration][i]
      }
    }

    p5.fill(200)
    p5.noStroke()
    p5.rect(x, y, hw, hh)
    p5.fill(0, 0, 0)

    const barW = hw / barLen
    const multiplier = (hh / maxH) * 0.9

    p5.textAlign(p5.LEFT)
    p5.textFont(font, 16)
    p5.stroke(128)
    p5.strokeWeight(2)

    let unit = 100

    if (maxH < 300) {
      unit = 50
    }

    if (maxH < 100) {
      unit = 20
    }

    if (maxH < 50) {
      unit = 10
    }

    for (let i = 0; i < hh / multiplier; i += unit) {
      let theY = y + hh - i * multiplier

      p5.line(x, theY, x + hw, theY)

      if (i == 0) {
        theY -= 5
      }

      p5.text(i, x + hw + 5, theY + 7)
    }

    p5.textAlign(p5.CENTER)

    for (let i = minBar; i <= maxBar; i += 10) {
      if (i == 0) {
        p5.stroke(0, 0, 255)
      } else {
        p5.stroke(128)
      }

      const theX = x + (i - minBar) * barW

      p5.text(p5.nf(i / histBarsPerMeter, 0, 1), theX, y + hh + 14)
      p5.line(theX, y, theX, y + hh)
    }

    p5.noStroke()

    for (let i = 0; i < barLen; i++) {
      const h = p5.min(barCounts[selectedGeneration][i] * multiplier, hh)

      if (
        i + minBar ==
        p5.floor(
          fitnessPercentileHistory[
            p5.min(selectedGeneration, fitnessPercentileHistory.length - 1)
          ][14] * histBarsPerMeter
        )
      ) {
        p5.fill(255, 0, 0)
      } else {
        p5.fill(0, 0, 0)
      }

      p5.rect(x + i * barW, y + hh - h, barW, h)
    }
  }

  p5.preload = () => {
    font = p5.loadFont('/fonts/Helvetica-Bold.otf')
  }

  p5.setup = () => {
    p5.frameRate(FRAME_RATE)
    p5.randomSeed(SEED)
    // Create a 1024x576 Canvas
    p5.createCanvas(
      windowWidth * windowSizeMultiplier,
      windowHeight * windowSizeMultiplier
    )
    p5.ellipseMode(p5.CENTER)

    fitnessPercentileHistory.push(new Array(fitnessPercentileCount).fill(0.0))
    barCounts.push(new Array(barLen).fill(0))
    speciesCounts.push(new Array(101).fill(500))
    topSpeciesCounts.push(0)

    graphImage = p5.createGraphics(975, 570)
    screenImage = p5.createGraphics(1920, 1080)
    popUpImage = p5.createGraphics(450, 450)
    segBarImage = p5.createGraphics(975, 150)

    segBarImage.background(220)
    popUpImage.background(220)

    p5.textFont(font, 96)
    p5.textAlign(p5.CENTER)
  }

  p5.draw = () => {
    p5.scale(windowSizeMultiplier)

    if (activity === Activity.Start) {
      p5.background(255)
      p5.noStroke()
      p5.fill(0)
      p5.text('EVOLUTION!', windowWidth / 2, 200)
      startViewStartButton.draw()
    } else if (activity === Activity.GenerationView) {
      p5.noStroke()
      p5.fill(0)
      p5.background(255, 200, 130)
      p5.textFont(font, 32)
      p5.textAlign(p5.LEFT)
      p5.textFont(font, 96)
      p5.text('Generation ' + p5.max(selectedGeneration, 0), 20, 100)
      p5.textFont(font, 28)

      if (generationCount == -1) {
        p5.fill(0)
        p5.text(
          `Since there are no creatures yet, create ${CREATURE_COUNT} creatures!`,
          20,
          160
        )
        p5.text('They will be randomly created, and also very simple.', 20, 200)
        generationViewCreateButton.draw()
      } else {
        simulateStepByStepButton.draw()
        simulateQuickButton.draw()
        simulateAsapButton.draw()
        simulateAlapButton.draw()

        p5.fill(0)
        p5.text('Median ' + fitnessName, 50, 160)
        p5.textAlign(p5.CENTER)
        p5.textAlign(p5.RIGHT)
        p5.text(
          p5.round(
            fitnessPercentileHistory[
              p5.min(selectedGeneration, fitnessPercentileHistory.length - 1)
            ][14] * 1000
          ) /
            1000 +
            ' ' +
            fitnessUnit,
          700,
          160
        )

        drawHistogram(760, 410, 460, 280)
        drawGraphImage()
      }

      if (gensToDo >= 1) {
        gensToDo--
        if (gensToDo >= 1) {
          startASAP()
        }
      }
    } else if (activity === Activity.GeneratingCreatures) {
      p5.background(220, 253, 102)
      p5.push()
      p5.scale(10.0 / scaleToFixBug)

      for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 40; x++) {
          simulationNodes.length = 0
          simulationMuscles.length = 0

          const nodeNum = p5.int(p5.random(3, 6))
          const muscleNum = p5.int(p5.random(nodeNum - 1, nodeNum * 3 - 6))

          for (let i = 0; i < nodeNum; i++) {
            simulationNodes.push(
              new Node(
                p5.random(-1, 1),
                p5.random(-1, 1),
                0,
                0,
                0.4,
                p5.random(0, 1),
                p5.random(0, 1),
                p5.floor(p5.random(0, operationCount)),
                p5.floor(p5.random(0, nodeNum)),
                p5.floor(p5.random(0, nodeNum))
              )
            ) // replaced all nodes' sizes with 0.4, used to be random(0.1,1), random(0,1)
          }

          for (let i = 0; i < muscleNum; i++) {
            const taxon = getNewMuscleAxon(nodeNum)

            let tc1 = 0
            let tc2 = 0

            if (i < nodeNum - 1) {
              tc1 = i
              tc2 = i + 1
            } else {
              tc1 = p5.int(p5.random(0, nodeNum))
              tc2 = tc1

              while (tc2 == tc1) {
                tc2 = p5.int(p5.random(0, nodeNum))
              }
            }

            let s = 0.8

            if (i >= 10) {
              s *= 1.414
            }

            const len = p5.random(0.5, 1.5)

            simulationMuscles.push(
              new Muscle(taxon, tc1, tc2, len, p5.random(0.02, 0.08))
            )
          }

          toStableConfiguration(nodeNum, muscleNum)
          adjustToCenter(nodeNum)

          const heartbeat = p5.random(40, 80)
          c[y * 40 + x] = new Creature(
            y * 40 + x + 1,
            [...simulationNodes],
            [...simulationMuscles],
            0,
            true,
            heartbeat,
            1.0
          )

          drawCreature(c[y * 40 + x], x * 3 + 5.5, y * 2.5 + 3, 0)

          c[y * 40 + x].checkForOverlap()
          c[y * 40 + x].checkForLoneNodes()
          c[y * 40 + x].checkForBadAxons()
        }
      }

      setActivity(Activity.GeneratedCreatures)

      p5.pop()
      p5.noStroke()
      p5.fill(0)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 24)
      p5.text(
        `Here are your ${CREATURE_COUNT} randomly generated creatures!!!`,
        windowWidth / 2 - 200,
        690
      )
      generatedCreaturesBackButton.draw()
    } else if (activity === Activity.RequestingSimulation) {
      setGlobalVariables(c[creaturesTested])
      camZoom = 0.01

      setActivity(Activity.SimulationRunning)

      if (!stepbystepslow) {
        for (let i = 0; i < CREATURE_COUNT; i++) {
          setGlobalVariables(c[i])

          for (let s = 0; s < 900; s++) {
            simulate()
          }

          setAverages()
          setFitness(i)
        }

        setActivity(Activity.SimulationFinished)
      }
    }

    if (activity === Activity.SimulationRunning) {
      // simulate running

      if (timer <= 900) {
        p5.background(120, 200, 255)

        for (let s = 0; s < speed; s++) {
          if (timer < 900) {
            simulate()
          }
        }

        setAverages()

        if (speed < 30) {
          for (let s = 0; s < speed; s++) {
            camX += (averageX - camX) * 0.06
            camY += (averageY - camY) * 0.06
          }
        } else {
          camX = averageX
          camY = averageY
        }

        p5.push()

        p5.translate(p5.width / 2.0, p5.height / 2.0)
        p5.scale(1.0 / camZoom / scaleToFixBug)
        p5.translate(-camX * scaleToFixBug, -camY * scaleToFixBug)

        drawPosts(0)
        drawGround(0)
        drawCreaturePieces(simulationNodes, simulationMuscles, 0, 0, 0)
        drawArrow(averageX)

        p5.pop()

        drawStats(windowWidth - 10, 0, 0.7)

        stepByStepSkipButton.draw()
        stepByStepPlaybackSpeedButton.draw()
        stepByStepFinishButton.draw()
      }

      if (timer == 900) {
        if (speed < 30) {
          p5.noStroke()
          p5.fill(0, 0, 0, 130)
          p5.rect(0, 0, windowWidth, windowHeight)
          p5.fill(0, 0, 0, 255)
          p5.rect(windowWidth / 2 - 500, 200, 1000, 240)
          p5.fill(255, 0, 0)
          p5.textAlign(p5.CENTER)
          p5.textFont(font, 96)
          p5.text("Creature's " + fitnessName + ':', windowWidth / 2, 300)
          p5.text(
            p5.nf(averageX * 0.2, 0, 2) + ' ' + fitnessUnit,
            windowWidth / 2,
            400
          )
        } else {
          timer = 1020
        }

        setFitness(creaturesTested)
      }

      if (timer >= 1020) {
        setActivity(Activity.RequestingSimulation)

        creaturesTested++
        if (creaturesTested == CREATURE_COUNT) {
          setActivity(Activity.SimulationFinished)
        }

        camX = 0
      }

      if (timer >= 900) {
        timer += speed
      }
    }

    if (activity === Activity.SimulationFinished) {
      // sort

      c2 = new Array<Creature>(0)

      for (let i = 0; i < CREATURE_COUNT; i++) {
        c2.push(c[i])
      }

      c2 = quickSort(c2)

      fitnessPercentileHistory.push(new Array<number>(fitnessPercentileCount))
      for (let i = 0; i < fitnessPercentileCount; i++) {
        fitnessPercentileHistory[generationCount + 1][i] =
          c2[fitnessPercentileCreatureIndices[i]].d
      }

      creatureDatabase.push(c2[lastCreatureIndex].copyCreature(-1))
      creatureDatabase.push(c2[midCreatureIndex].copyCreature(-1))
      creatureDatabase.push(c2[0].copyCreature(-1))

      const beginBar = new Array<number>(barLen)
      for (let i = 0; i < barLen; i++) {
        beginBar[i] = 0
      }

      barCounts.push(beginBar)

      const beginSpecies = new Array<number>(101)

      for (let i = 0; i < 101; i++) {
        beginSpecies[i] = 0
      }

      for (let i = 0; i < CREATURE_COUNT; i++) {
        const bar = p5.floor(c2[i].d * histBarsPerMeter - minBar)

        if (bar >= 0 && bar < barLen) {
          barCounts[generationCount + 1][bar]++
        }

        const species = (c2[i].n.length % 10) * 10 + (c2[i].m.length % 10)
        beginSpecies[species]++
      }

      speciesCounts.push(new Array<number>(101))
      speciesCounts[generationCount + 1][0] = 0

      let cum = 0
      let record = 0
      let holder = 0

      for (let i = 0; i < 100; i++) {
        cum += beginSpecies[i]
        speciesCounts[generationCount + 1][i + 1] = cum

        if (beginSpecies[i] > record) {
          record = beginSpecies[i]
          holder = i
        }
      }

      topSpeciesCounts.push(holder)

      if (stepbystep) {
        drawScreenImage(0)
        setActivity(Activity.FinishedStepByStep)
      } else {
        setActivity(Activity.CullingCreatures)
      }
    }

    if (activity === Activity.SortingCreatures) {
      // cool sorting animation

      p5.background(220, 253, 102)
      p5.push()
      p5.scale(10.0 / scaleToFixBug)

      const transition = 0.5 - 0.5 * p5.cos(p5.min(timer / 60, p5.PI))

      for (let j = 0; j < CREATURE_COUNT; j++) {
        const cj = c2[j]
        const j2 = cj.id - generationCount * CREATURE_COUNT - 1
        const x1 = j2 % 40
        const y1 = p5.floor(j2 / 40)
        const x2 = j % 40
        const y2 = p5.floor(j / 40) + 1
        const x3 = inter(x1, x2, transition)
        const y3 = inter(y1, y2, transition)

        drawCreature(cj, x3 * 3 + 5.5, y3 * 2.5 + 4, 0)
      }

      p5.pop()

      if (stepbystepslow) {
        timer += 2
      } else {
        timer += 10
      }

      sortingCreaturesSkipButton.draw()

      if (timer > 60 * p5.PI) {
        drawScreenImage(1)
        setActivity(Activity.SortedCreatures)
      }
    }

    const {mX, mY} = getCursorPosition()

    if (
      (activity === Activity.FinishedStepByStep ||
        activity === Activity.SortingCreatures ||
        activity === Activity.SortedCreatures ||
        activity === Activity.CullingCreatures ||
        activity === Activity.CulledCreatures) &&
      gensToDo == 0 &&
      !draggingSlider
    ) {
      /*
       * When the cursor is over any of the creature tiles, the popup simulation
       * will be displayed for the associated creature.
       */

      let idOfCreatureUnderCursor: number | null = null

      if (p5.abs(mX - 639.5) <= 599.5) {
        if (
          activity === Activity.FinishedStepByStep &&
          p5.abs(mY - 329) <= 312
        ) {
          idOfCreatureUnderCursor =
            creaturesInPosition[
              p5.floor((mX - 40) / 30) + p5.floor((mY - 17) / 25) * 40
            ]
        } else if (
          (activity === Activity.SortedCreatures ||
            activity === Activity.CullingCreatures ||
            activity === Activity.CulledCreatures) &&
          p5.abs(mY - 354) <= 312
        ) {
          idOfCreatureUnderCursor =
            p5.floor((mX - 40) / 30) + p5.floor((mY - 42) / 25) * 40
        }
      }

      if (idOfCreatureUnderCursor != null) {
        setPopupSimulationCreatureId(idOfCreatureUnderCursor)
      } else {
        clearPopupSimulation()
      }
    } else if (
      activity === Activity.GenerationView &&
      selectedGeneration >= 1 &&
      gensToDo == 0 &&
      !draggingSlider
    ) {
      /*
       * When the cursor is over the worst, median, or best creature, the popup
       * simulation will be displayed for that creature.
       */

      let worstMedianOrBest: number | null = null

      if (p5.abs(mY - 250) <= 70) {
        if (p5.abs(mX - 990) <= 230) {
          const modX = (mX - 760) % 160

          if (modX < 140) {
            worstMedianOrBest = p5.floor((mX - 760) / 160) - 3
          }
        }
      }

      if (worstMedianOrBest != null) {
        setPopupSimulationCreatureId(worstMedianOrBest)
      } else {
        clearPopupSimulation()
      }
    } else {
      clearPopupSimulation()
    }

    if (activity === Activity.CullingCreatures) {
      // Kill!

      for (let j = 0; j < 500; j++) {
        const f = j / CREATURE_COUNT
        const rand = (p5.pow(p5.random(-1, 1), 3) + 1) / 2 // cube function

        slowDies = f <= rand

        let j2
        let j3

        if (slowDies) {
          j2 = j
          j3 = lastCreatureIndex - j
        } else {
          j2 = lastCreatureIndex - j
          j3 = j
        }

        const cj = c2[j2]
        cj.alive = true

        const ck = c2[j3]
        ck.alive = false
      }

      if (stepbystep) {
        drawScreenImage(2)
        setActivity(Activity.CulledCreatures)
      } else {
        setActivity(Activity.PropagatingCreatures)
      }
    }

    if (activity === Activity.PropagatingCreatures) {
      // Reproduce and mutate

      for (let j = 0; j < 500; j++) {
        let j2 = j
        if (!c2[j].alive) {
          j2 = lastCreatureIndex - j
        }

        const cj = c2[j2]
        const cj2 = c2[lastCreatureIndex - j2]

        c2[j2] = cj.copyCreature(cj.id + CREATURE_COUNT) // duplicate
        c2[lastCreatureIndex - j2] = cj.modified(cj2.id + CREATURE_COUNT) // mutated offspring 1

        simulationNodes = c2[lastCreatureIndex - j2].n
        simulationMuscles = c2[lastCreatureIndex - j2].m

        toStableConfiguration(simulationNodes.length, simulationMuscles.length)
        adjustToCenter(simulationNodes.length)
      }

      for (let j = 0; j < CREATURE_COUNT; j++) {
        const cj = c2[j]
        c[cj.id - generationCount * CREATURE_COUNT - (CREATURE_COUNT + 1)] =
          cj.copyCreature(-1)
      }

      drawScreenImage(3)

      generationCount++

      if (stepbystep) {
        setActivity(Activity.PropagatedCreatures)
      } else {
        setActivity(Activity.GenerationView)
      }
    }

    if (
      activity === Activity.FinishedStepByStep ||
      activity === Activity.SortedCreatures ||
      activity === Activity.CulledCreatures ||
      activity === Activity.PropagatedCreatures
    ) {
      p5.image(screenImage, 0, 0, windowWidth, windowHeight)
    }

    if (activity === Activity.GenerationView || gensToDo >= 1) {
      p5.noStroke()

      if (generationCount >= 1) {
        if (generationCount >= 5) {
          selectedGeneration =
            p5.round(((sliderX - 760) * (generationCount - 1)) / 410) + 1
        } else {
          selectedGeneration = p5.round(
            ((sliderX - 760) * generationCount) / 410
          )
        }

        if (draggingSlider) {
          generationSlider.onDrag()
        }

        generationSlider.draw()
      }

      if (selectedGeneration >= 1) {
        p5.textAlign(p5.CENTER)

        for (let k = 0; k < 3; k++) {
          p5.fill(220)
          p5.rect(760 + k * 160, 180, 140, 140)

          p5.push()

          p5.translate(830 + 160 * k, 290)
          p5.scale(60.0 / scaleToFixBug)

          drawCreature(
            creatureDatabase[(selectedGeneration - 1) * 3 + k],
            0,
            0,
            0
          )

          p5.pop()
        }

        p5.fill(0)
        p5.textFont(font, 16)
        p5.text('Worst Creature', 830, 310)
        p5.text('Median Creature', 990, 310)
        p5.text('Best Creature', 1150, 310)
      }
    }

    if (statusWindow >= -3) {
      statusWindowView.draw()
    }

    overallTimer++
  }

  function setPopupSimulationCreatureId(id: number): void {
    const popupCurrentlyClosed = statusWindow == -4
    statusWindow = id

    let creature: Creature
    let targetCreatureId: number

    if (statusWindow <= -1) {
      creature =
        creatureDatabase[(selectedGeneration - 1) * 3 + statusWindow + 3]
      targetCreatureId = creature.id
    } else {
      targetCreatureId = statusWindow
      creature = c2[id]
    }

    if (
      popupSimulationCreatureId !== targetCreatureId ||
      popupCurrentlyClosed
    ) {
      simulationTimer = 0

      if (gensToDo == 0) {
        // The full simulation is not running, so the popup simulation can be shown.
        showPopupSimulation = true

        setGlobalVariables(creature)
        popupSimulationCreatureId = targetCreatureId
      }
    }
  }

  function clearPopupSimulation(): void {
    statusWindow = -4
  }

  function drawStats(x: number, y: number, size: number): void {
    p5.textAlign(p5.RIGHT)
    p5.textFont(font, 32)
    p5.fill(0)

    p5.push()

    p5.translate(x, y)
    p5.scale(size)
    p5.text('Creature ID: ' + id, 0, 32)

    if (speed > 60) {
      timeShow = p5.int((timer + creaturesTested * 37) / 60) % 15
    } else {
      timeShow = timer / 60
    }

    p5.text('Time: ' + p5.nf(timeShow, 0, 2) + ' / 15 sec.', 0, 64)
    p5.text('Playback Speed: x' + p5.max(1, speed), 0, 96)

    let extraWord = 'used'
    if (energyDirection == -1) {
      extraWord = 'left'
    }

    p5.text('X: ' + p5.nf(averageX / 5.0, 0, 2) + '', 0, 128)
    p5.text('Y: ' + p5.nf(-averageY / 5.0, 0, 2) + '', 0, 160)
    p5.text(
      'Energy ' + extraWord + ': ' + p5.nf(energy, 0, 2) + ' yums',
      0,
      192
    )
    p5.text('A.N.Nausea: ' + p5.nf(averageNodeNausea, 0, 2) + ' blehs', 0, 224)

    p5.pop()
  }

  function setGlobalVariables(thisCreature: Creature): void {
    simulationNodes.length = 0
    simulationMuscles.length = 0

    for (let i = 0; i < thisCreature.n.length; i++) {
      simulationNodes.push(thisCreature.n[i].copyNode())
    }

    for (let i = 0; i < thisCreature.m.length; i++) {
      simulationMuscles.push(thisCreature.m[i].copyMuscle())
    }

    id = thisCreature.id
    timer = 0
    camZoom = 0.01
    camX = 0
    camY = 0
    simulationTimer = 0
    energy = baselineEnergy
    totalNodeNausea = 0
    averageNodeNausea = 0
  }

  function setFitness(i: number): void {
    c[i].d = averageX * 0.2 // Multiply by 0.2 because a meter is 5 units for some weird reason.
  }
}
