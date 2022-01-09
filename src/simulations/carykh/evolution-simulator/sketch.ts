import type p5 from 'p5'
import type {Color, Font, Graphics} from 'p5'

import Creature from './Creature'
import Muscle from './Muscle'
import Node from './Node'
import Rectangle from './Rectangle'
import {Activity} from './constants'

type SimulationCameraState = {
  x: number
  y: number
  zoom: number
}

type SimulationCreatureState = {
  averageNodeNausea: number
  energyUsed: number
  id: number
  muscles: Muscle[]
  nodes: Node[]
  totalNodeNausea: number
}

type SimulationState = {
  camera: SimulationCameraState
  creature: SimulationCreatureState
  speed: number
  timer: number
}

export default function sketch(p5: p5) {
  const AIR_FRICTION = 0.95
  const AXON_COLOR = p5.color(255, 255, 0)
  const CREATURE_COUNT = 1000
  const ENERGY_UNIT = 20
  const FITNESS_LABEL = 'Distance'
  const FITNESS_UNIT_LABEL = 'm'
  const FONT_SIZES = [50, 36, 25, 20, 16, 14, 11, 9]
  const FRAME_RATE = 60 // target frames per second
  const FRICTION = 4
  const GRAVITY = 0.005
  const NAUSEA_UNIT = 5
  const NODE_TEXT_LINE_MULTIPLIER_Y1 = -0.08 // These are for the lines of text on each node.
  const NODE_TEXT_LINE_MULTIPLIER_Y2 = 0.35
  const PRESSURE_UNIT = 500.0 / 2.37
  const SEED = 0
  const WINDOW_SIZE_MULTIPLIER = 0.8

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
  let baselineEnergy = 0.0
  let bigMutationChance = 0.06
  let hazelStairs = -1

  let minBar = -10
  let maxBar = 100
  let barLen = maxBar - minBar
  let gensToDo = 0
  let postFontSize = 0.96
  let scaleToFixBug = 1000

  let windowWidth = 1280
  let windowHeight = 720
  let generationCount = -1
  let sliderX = 1170
  let selectedGeneration = 0
  let draggingSlider = false
  let creaturesTested = 0

  let popupSimulationCreatureId: number | null

  let statusWindow = -4
  const creaturesInPosition = new Array<number>(CREATURE_COUNT)

  const appState = {
    currentActivityId: Activity.Start,
    showPopupSimulation: false,
    viewTimer: 0
  }

  const simulationState: SimulationState = {
    camera: {
      x: 0,
      y: 0,
      zoom: 0.015
    },

    creature: {
      averageNodeNausea: 0,
      energyUsed: 0,
      id: 0,
      muscles: [],
      nodes: [],
      totalNodeNausea: 0
    },

    speed: 1,
    timer: 0
  }

  const c = new Array<Creature>(CREATURE_COUNT)

  let c2: Creature[] = []

  let stepByStep: boolean
  let stepByStepSlow: boolean

  class Simulation {
    applyForceToMuscle(muscle: Muscle, nodes: Node[]): void {
      let target = muscle.previousTarget

      if (muscle.axon >= 0 && muscle.axon < nodes.length) {
        target = muscle.len * toMuscleUsable(nodes[muscle.axon].value)
      } else {
        target = muscle.len
      }

      const ni1 = nodes[muscle.c1]
      const ni2 = nodes[muscle.c2]

      const distance = p5.dist(ni1.x, ni1.y, ni2.x, ni2.y)
      const angle = p5.atan2(ni1.y - ni2.y, ni1.x - ni2.x)

      const force = p5.min(p5.max(1 - distance / target, -0.4), 0.4)
      ni1.vx += (p5.cos(angle) * force * muscle.rigidity) / ni1.m
      ni1.vy += (p5.sin(angle) * force * muscle.rigidity) / ni1.m
      ni2.vx -= (p5.cos(angle) * force * muscle.rigidity) / ni2.m
      ni2.vy -= (p5.sin(angle) * force * muscle.rigidity) / ni2.m

      simulationState.creature.energyUsed = p5.max(
        simulationState.creature.energyUsed +
          p5.abs(muscle.previousTarget - target) *
            muscle.rigidity *
            ENERGY_UNIT,
        0
      )

      muscle.previousTarget = target
    }

    applyForcesToNode(node: Node): void {
      node.vx *= AIR_FRICTION
      node.vy *= AIR_FRICTION
      node.y += node.vy
      node.x += node.vx
      const acc = p5.dist(node.vx, node.vy, node.pvx, node.pvy)
      simulationState.creature.totalNodeNausea += acc * acc * NAUSEA_UNIT
      node.pvx = node.vx
      node.pvy = node.vy
    }

    applyGravityToNode(node: Node): void {
      node.vy += GRAVITY
    }

    applyCollisionsToNode(node: Node): void {
      node.pressure = 0
      let dif = node.y + node.m / 2

      if (dif >= 0 && haveGround) {
        this.pressNodeAgainstGround(node, 0)
      }

      if (node.y > node.prevY && hazelStairs >= 0) {
        const bottomPointNow = node.y + node.m / 2
        const bottomPointPrev = node.prevY + node.m / 2
        const levelNow = p5.int(p5.ceil(bottomPointNow / hazelStairs))
        const levelPrev = p5.int(p5.ceil(bottomPointPrev / hazelStairs))

        if (levelNow > levelPrev) {
          const groundLevel = levelPrev * hazelStairs
          this.pressNodeAgainstGround(node, groundLevel)
        }
      }

      for (let i = 0; i < rects.length; i++) {
        const r = rects[i]
        let flip = false
        let px, py

        if (
          p5.abs(node.x - (r.x1 + r.x2) / 2) <= (r.x2 - r.x1 + node.m) / 2 &&
          p5.abs(node.y - (r.y1 + r.y2) / 2) <= (r.y2 - r.y1 + node.m) / 2
        ) {
          if (
            node.x >= r.x1 &&
            node.x < r.x2 &&
            node.y >= r.y1 &&
            node.y < r.y2
          ) {
            const d1 = node.x - r.x1
            const d2 = r.x2 - node.x
            const d3 = node.y - r.y1
            const d4 = r.y2 - node.y

            if (d1 < d2 && d1 < d3 && d1 < d4) {
              px = r.x1
              py = node.y
            } else if (d2 < d3 && d2 < d4) {
              px = r.x2
              py = node.y
            } else if (d3 < d4) {
              px = node.x
              py = r.y1
            } else {
              px = node.x
              py = r.y2
            }

            flip = true
          } else {
            if (node.x < r.x1) {
              px = r.x1
            } else if (node.x < r.x2) {
              px = node.x
            } else {
              px = r.x2
            }

            if (node.y < r.y1) {
              py = r.y1
            } else if (node.y < r.y2) {
              py = node.y
            } else {
              py = r.y2
            }
          }

          const distance = p5.dist(node.x, node.y, px, py)
          let rad = node.m / 2
          let wallAngle = p5.atan2(py - node.y, px - node.x)

          if (flip) {
            wallAngle += p5.PI
          }

          if (distance < rad || flip) {
            dif = rad - distance

            node.pressure += dif * PRESSURE_UNIT
            let multi = rad / distance

            if (flip) {
              multi = -multi
            }

            node.x = (node.x - px) * multi + px
            node.y = (node.y - py) * multi + py

            const veloAngle = p5.atan2(node.vy, node.vx)
            const veloMag = p5.dist(0, 0, node.vx, node.vy)
            const relAngle = veloAngle - wallAngle
            const relY = p5.sin(relAngle) * veloMag * dif * FRICTION

            node.vx = -p5.sin(relAngle) * relY
            node.vy = p5.cos(relAngle) * relY
          }
        }
      }

      node.prevY = node.y
      node.prevX = node.x
    }

    modifyCreature(creature: Creature, id: number): Creature {
      const modifiedCreature = new Creature(
        id,
        [],
        [],
        0,
        true,
        creature.creatureTimer + r() * 16 * creature.mutability,
        p5.min(creature.mutability * p5.random(0.8, 1.25), 2)
      )

      for (let i = 0; i < creature.nodes.length; i++) {
        modifiedCreature.nodes.push(
          this.modifyNode(
            creature.nodes[i],
            creature.mutability,
            creature.nodes.length
          )
        )
      }

      for (let i = 0; i < creature.muscles.length; i++) {
        const muscle = this.modifyMuscle(
          creature.muscles[i],
          creature.nodes.length,
          creature.mutability
        )
        modifiedCreature.muscles.push(muscle)
      }

      if (
        p5.random(0, 1) < bigMutationChance * creature.mutability ||
        creature.nodes.length <= 2
      ) {
        // Add a node
        this.addRandomNode(modifiedCreature)
      }

      if (p5.random(0, 1) < bigMutationChance * creature.mutability) {
        // Add a muscle
        this.addRandomMuscle(modifiedCreature, -1, -1)
      }

      if (
        p5.random(0, 1) < bigMutationChance * creature.mutability &&
        modifiedCreature.nodes.length >= 4
      ) {
        // Remove a node
        this.removeRandomNode(modifiedCreature)
      }

      if (
        p5.random(0, 1) < bigMutationChance * creature.mutability &&
        modifiedCreature.muscles.length >= 2
      ) {
        // Remove a muscle
        this.removeRandomMuscle(modifiedCreature)
      }

      this.resolveCreatureIssues(modifiedCreature)

      return modifiedCreature
    }

    modifyMuscle(
      muscle: Muscle,
      nodeCount: number,
      mutability: number
    ): Muscle {
      let newc1 = muscle.c1
      let newc2 = muscle.c2
      let newAxon = muscle.axon

      if (p5.random(0, 1) < bigMutationChance * mutability) {
        newc1 = p5.int(p5.random(0, nodeCount))
      }

      if (p5.random(0, 1) < bigMutationChance * mutability) {
        newc2 = p5.int(p5.random(0, nodeCount))
      }

      if (p5.random(0, 1) < bigMutationChance * mutability) {
        newAxon = getNewMuscleAxon(nodeCount)
      }

      const newR = p5.min(
        p5.max(muscle.rigidity * (1 + r() * 0.9 * mutability), 0.01),
        0.08
      )
      const newLen = p5.min(p5.max(muscle.len + r() * mutability, 0.4), 1.25)

      return new Muscle(newAxon, newc1, newc2, newLen, newR)
    }

    modifyNode(node: Node, mutability: number, nodeNum: number): Node {
      const newX = node.x + r() * 0.5 * mutability
      const newY = node.y + r() * 0.5 * mutability
      let newM = node.m + r() * 0.1 * mutability

      newM = p5.min(p5.max(newM, 0.3), 0.5)
      newM = 0.4

      let newV = node.value * (1 + r() * 0.2 * mutability)
      let newOperation = node.operation
      let newAxon1 = node.axon1
      let newAxon2 = node.axon2

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
        // node.y - coordinate
        newV = -newY * 0.2
      }

      return new Node(
        newX,
        newY,
        0,
        0,
        newM,
        p5.min(p5.max(node.f + r() * 0.1 * mutability, 0), 1),
        newV,
        newOperation,
        newAxon1,
        newAxon2
      )
    }

    processNodeAxons(node: Node, nodes: Node[]): void {
      const axonValue1 = nodes[node.axon1].value
      const axonValue2 = nodes[node.axon2].value

      if (node.operation == 0) {
        // constant
      } else if (node.operation == 1) {
        // time
        node.valueToBe = simulationState.timer / 60.0
      } else if (node.operation == 2) {
        // x - coordinate
        node.valueToBe = node.x * 0.2
      } else if (node.operation == 3) {
        // node.y - coordinate
        node.valueToBe = -node.y * 0.2
      } else if (node.operation == 4) {
        // plus
        node.valueToBe = axonValue1 + axonValue2
      } else if (node.operation == 5) {
        // minus
        node.valueToBe = axonValue1 - axonValue2
      } else if (node.operation == 6) {
        // times
        node.valueToBe = axonValue1 * axonValue2
      } else if (node.operation == 7) {
        // divide
        node.valueToBe = axonValue2 === 0 ? 0 : axonValue1 / axonValue2
      } else if (node.operation == 8) {
        // modulus
        node.valueToBe = axonValue2 === 0 ? 0 : axonValue1 % axonValue2
      } else if (node.operation == 9) {
        // sin
        node.valueToBe = p5.sin(axonValue1)
      } else if (node.operation == 10) {
        // sig
        node.valueToBe = 1 / (1 + p5.pow(2.71828182846, -axonValue1))
      } else if (node.operation == 11) {
        // pressure
        node.valueToBe = node.pressure
      }
    }

    resolveCreatureIssues(creature: Creature): void {
      this.resolveCreatureMuscleOverlap(creature)
      this.resolveCreatureLoneNodes(creature)
      this.resolveCreatureBadAxons(creature)
    }

    addRandomNode(creature: Creature): void {
      const parentNode = p5.floor(p5.random(0, creature.nodes.length))
      const ang1 = p5.random(0, 2 * p5.PI)
      const distance = p5.sqrt(p5.random(0, 1))
      const x = creature.nodes[parentNode].x + p5.cos(ang1) * 0.5 * distance
      const y = creature.nodes[parentNode].y + p5.sin(ang1) * 0.5 * distance

      const newNodeCount = creature.nodes.length + 1

      creature.nodes.push(
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

      for (let i = 0; i < creature.nodes.length - 1; i++) {
        if (i != parentNode) {
          const dx = creature.nodes[i].x - x
          const dy = creature.nodes[i].y - y

          if (p5.sqrt(dx * dx + dy * dy) < record) {
            record = p5.sqrt(dx * dx + dy * dy)
            nextClosestNode = i
          }
        }
      }

      this.addRandomMuscle(creature, parentNode, creature.nodes.length - 1)
      this.addRandomMuscle(creature, nextClosestNode, creature.nodes.length - 1)
    }

    addRandomMuscle(creature: Creature, tc1: number, tc2: number): void {
      const axon = getNewMuscleAxon(creature.nodes.length)

      if (tc1 == -1) {
        tc1 = p5.int(p5.random(0, creature.nodes.length))
        tc2 = tc1

        while (tc2 == tc1 && creature.nodes.length >= 2) {
          tc2 = p5.int(p5.random(0, creature.nodes.length))
        }
      }

      let len = p5.random(0.5, 1.5)

      if (tc1 != -1) {
        len = p5.dist(
          creature.nodes[tc1].x,
          creature.nodes[tc1].y,
          creature.nodes[tc2].x,
          creature.nodes[tc2].y
        )
      }

      creature.muscles.push(
        new Muscle(axon, tc1, tc2, len, p5.random(0.02, 0.08))
      )
    }

    removeRandomNode(creature: Creature): void {
      const choice = p5.floor(p5.random(0, creature.nodes.length))
      creature.nodes.splice(choice, 1)

      let i = 0

      while (i < creature.muscles.length) {
        if (
          creature.muscles[i].c1 == choice ||
          creature.muscles[i].c2 == choice
        ) {
          creature.muscles.splice(i, 1)
        } else {
          i++
        }
      }

      for (let j = 0; j < creature.muscles.length; j++) {
        if (creature.muscles[j].c1 >= choice) {
          creature.muscles[j].c1--
        }

        if (creature.muscles[j].c2 >= choice) {
          creature.muscles[j].c2--
        }
      }
    }

    removeRandomMuscle(creature: Creature): void {
      const choice = p5.floor(p5.random(0, creature.muscles.length))
      creature.muscles.splice(choice, 1)
    }

    private resolveCreatureMuscleOverlap(creature: Creature): void {
      const bads = []

      for (let i = 0; i < creature.muscles.length; i++) {
        for (let j = i + 1; j < creature.muscles.length; j++) {
          if (
            creature.muscles[i].c1 == creature.muscles[j].c1 &&
            creature.muscles[i].c2 == creature.muscles[j].c2
          ) {
            bads.push(i)
          } else if (
            creature.muscles[i].c1 == creature.muscles[j].c2 &&
            creature.muscles[i].c2 == creature.muscles[j].c1
          ) {
            bads.push(i)
          } else if (creature.muscles[i].c1 == creature.muscles[i].c2) {
            bads.push(i)
          }
        }
      }

      for (let i = bads.length - 1; i >= 0; i--) {
        const b = bads[i] + 0

        if (b < creature.muscles.length) {
          creature.muscles.splice(b, 1)
        }
      }
    }

    private resolveCreatureLoneNodes(creature: Creature): void {
      if (creature.nodes.length >= 3) {
        for (let i = 0; i < creature.nodes.length; i++) {
          let connections = 0
          let connectedTo = -1

          for (let j = 0; j < creature.muscles.length; j++) {
            if (creature.muscles[j].c1 == i || creature.muscles[j].c2 == i) {
              connections++
              connectedTo = j
            }
          }

          if (connections <= 1) {
            let newConnectionNode = p5.floor(
              p5.random(0, creature.nodes.length)
            )

            while (newConnectionNode == i || newConnectionNode == connectedTo) {
              newConnectionNode = p5.floor(p5.random(0, creature.nodes.length))
            }

            this.addRandomMuscle(creature, i, newConnectionNode)
          }
        }
      }
    }

    private resolveCreatureBadAxons(creature: Creature): void {
      for (let i = 0; i < creature.nodes.length; i++) {
        const ni = creature.nodes[i]

        if (ni.axon1 >= creature.nodes.length) {
          ni.axon1 = p5.int(p5.random(0, creature.nodes.length))
        }

        if (ni.axon2 >= creature.nodes.length) {
          ni.axon2 = p5.int(p5.random(0, creature.nodes.length))
        }
      }

      for (let i = 0; i < creature.muscles.length; i++) {
        const mi = creature.muscles[i]

        if (mi.axon >= creature.nodes.length) {
          mi.axon = getNewMuscleAxon(creature.nodes.length)
        }
      }

      for (let i = 0; i < creature.nodes.length; i++) {
        const ni = creature.nodes[i]
        ni.safeInput = operationAxons[ni.operation] == 0
      }

      let iterations = 0
      let didSomething = false

      while (iterations < 1000) {
        didSomething = false

        for (let i = 0; i < creature.nodes.length; i++) {
          const ni = creature.nodes[i]

          if (!ni.safeInput) {
            if (
              (operationAxons[ni.operation] == 1 &&
                creature.nodes[ni.axon1].safeInput) ||
              (operationAxons[ni.operation] == 2 &&
                creature.nodes[ni.axon1].safeInput &&
                creature.nodes[ni.axon2].safeInput)
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

      for (let i = 0; i < creature.nodes.length; i++) {
        const ni = creature.nodes[i]

        if (!ni.safeInput) {
          // This node doesn't get its input from a safe place.  CLEANSE IT.
          ni.operation = 0
          ni.value = p5.random(0, 1)
        }
      }
    }

    private pressNodeAgainstGround(node: Node, groundY: number): void {
      const dif = node.y - (groundY - node.m / 2)
      node.pressure += dif * PRESSURE_UNIT
      node.y = groundY - node.m / 2
      node.vy = 0
      node.x -= node.vx * node.f

      if (node.vx > 0) {
        node.vx -= node.f * dif * FRICTION
        if (node.vx < 0) {
          node.vx = 0
        }
      } else {
        node.vx += node.f * dif * FRICTION
        if (node.vx > 0) {
          node.vx = 0
        }
      }
    }
  }

  const simulation = new Simulation()

  function inter(a: number, b: number, offset: number): number {
    return a + (b - a) * offset
  }

  function r(): number {
    return p5.pow(p5.random(-1, 1), 19)
  }

  function getCursorPosition(): {mX: number; mY: number} {
    const mX = p5.mouseX / WINDOW_SIZE_MULTIPLIER
    const mY = p5.mouseY / WINDOW_SIZE_MULTIPLIER

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
      simulationState.speed = 1
      creaturesTested = 0
      stepByStep = true
      stepByStepSlow = true
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
      stepByStep = true
      stepByStepSlow = false
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
      for (let s = appState.viewTimer; s < 900; s++) {
        simulate()
      }

      appState.viewTimer = 1021
    }
  }

  class StepByStepPlaybackSpeedButton extends Widget {
    draw(): void {
      p5.fill(0)
      p5.rect(120, windowHeight - 40, 240, 40)
      p5.fill(255)
      p5.textAlign(p5.CENTER)
      p5.textFont(font, 32)
      p5.text('PB speed: x' + simulationState.speed, 240, windowHeight - 8)
    }

    isUnderCursor(): boolean {
      return rectIsUnderCursor(120, windowHeight - 40, 240, 40)
    }

    onClick(): void {
      simulationState.speed *= 2

      if (simulationState.speed === 1024) {
        simulationState.speed = 900
      }

      if (simulationState.speed >= 1800) {
        simulationState.speed = 1
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
      for (let s = appState.viewTimer; s < 900; s++) {
        simulate()
      }

      appState.viewTimer = 0
      creaturesTested++

      for (let i = creaturesTested; i < CREATURE_COUNT; i++) {
        setSimulationState(c[i])

        for (let s = 0; s < 900; s++) {
          simulate()
        }

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
      appState.viewTimer = 100000
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

      const fontSize = FONT_SIZES[fs]

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

      p5.stroke(p5.abs((p5.frameCount % 30) - 15) * 17) // oscillate between 0–255
      p5.strokeWeight(3)
      p5.noFill()

      if (statusWindow >= 0) {
        cj = c2[statusWindow]

        if (appState.currentActivityId === Activity.FinishedStepByStep) {
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
      p5.text('Fitness: ' + p5.nf(cj.fitness, 0, 3), px, py + 36)
      p5.colorMode(p5.HSB, 1)

      const sp = (cj.nodes.length % 10) * 10 + (cj.muscles.length % 10)
      p5.fill(getColor(sp, true))
      p5.text(
        'Species: S' + (cj.nodes.length % 10) + '' + (cj.muscles.length % 10),
        px,
        py + 48
      )
      p5.colorMode(p5.RGB, 255)

      if (appState.showPopupSimulation) {
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

      simulationState.camera.zoom = 0.009

      const {averageX, averageY} = getNodesAverage(
        simulationState.creature.nodes
      )
      simulationState.camera.x += (averageX - simulationState.camera.x) * 0.1
      simulationState.camera.y += (averageY - simulationState.camera.y) * 0.1

      popUpImage.push()
      popUpImage.translate(225, 225)
      popUpImage.scale(1.0 / simulationState.camera.zoom / scaleToFixBug)
      popUpImage.translate(
        -simulationState.camera.x * scaleToFixBug,
        -simulationState.camera.y * scaleToFixBug
      )

      if (simulationState.timer < 900) {
        popUpImage.background(120, 200, 255)
      } else {
        popUpImage.background(60, 100, 128)
      }

      drawPosts(2)
      drawGround(2)
      drawCreaturePieces(
        simulationState.creature.nodes,
        simulationState.creature.muscles,
        0,
        0,
        2
      )

      popUpImage.noStroke()
      popUpImage.pop()

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

  function getNewMuscleAxon(nodeNum: number): number {
    if (p5.random(0, 1) < 0.5) {
      return p5.int(p5.random(0, nodeNum))
    } else {
      return -1
    }
  }

  function drawGround(toImage: number): void {
    const {averageX, averageY} = getNodesAverage(simulationState.creature.nodes)

    const stairDrawStart = p5.max(1, p5.int(-averageY / hazelStairs) - 10)

    if (toImage == 0) {
      p5.noStroke()
      p5.fill(0, 130, 0)

      if (haveGround) {
        p5.rect(
          (simulationState.camera.x - simulationState.camera.zoom * 800.0) *
            scaleToFixBug,
          0 * scaleToFixBug,
          simulationState.camera.zoom * 1600.0 * scaleToFixBug,
          simulationState.camera.zoom * 900.0 * scaleToFixBug
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
          (simulationState.camera.x - simulationState.camera.zoom * 300.0) *
            scaleToFixBug,
          0 * scaleToFixBug,
          simulationState.camera.zoom * 600.0 * scaleToFixBug,
          simulationState.camera.zoom * 600.0 * scaleToFixBug
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
        (ni.y + ni.m * NODE_TEXT_LINE_MULTIPLIER_Y2 + y) * scaleToFixBug
      )
      p5.text(
        operationNames[ni.operation],
        (ni.x + x) * scaleToFixBug,
        (ni.y + ni.m * NODE_TEXT_LINE_MULTIPLIER_Y1 + y) * scaleToFixBug
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
        (ni.y + ni.m * NODE_TEXT_LINE_MULTIPLIER_Y2 + y) * scaleToFixBug
      )
      screenImage.text(
        operationNames[ni.operation],
        (ni.x + x) * scaleToFixBug,
        (ni.y + ni.m * NODE_TEXT_LINE_MULTIPLIER_Y1 + y) * scaleToFixBug
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
        (ni.y + ni.m * NODE_TEXT_LINE_MULTIPLIER_Y2 + y) * scaleToFixBug
      )
      popUpImage.text(
        operationNames[ni.operation],
        (ni.x + x) * scaleToFixBug,
        (ni.y + ni.m * NODE_TEXT_LINE_MULTIPLIER_Y1 + y) * scaleToFixBug
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
      p5.stroke(AXON_COLOR)
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
      screenImage.stroke(AXON_COLOR)
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
      popUpImage.stroke(AXON_COLOR)
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
        p5.fill(AXON_COLOR)
        p5.textAlign(p5.CENTER)
        p5.textFont(font, 0.4 * averageMass * scaleToFixBug)
        p5.text(
          p5.nf(toMuscleUsable(n[mi.axon].value), 0, 2),
          muscleMidX * scaleToFixBug,
          muscleMidY * scaleToFixBug
        )
      } else if (toImage == 1) {
        screenImage.fill(AXON_COLOR)
        screenImage.textAlign(p5.CENTER)
        screenImage.textFont(font, 0.4 * averageMass * scaleToFixBug)
        screenImage.text(
          p5.nf(toMuscleUsable(n[mi.axon].value), 0, 2),
          muscleMidX * scaleToFixBug,
          muscleMidY * scaleToFixBug
        )
      } else if (toImage == 2) {
        popUpImage.fill(AXON_COLOR)
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
    const {averageX, averageY} = getNodesAverage(simulationState.creature.nodes)
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
      graphImage.text(
        showUnit(i, unit) + ' ' + FITNESS_UNIT_LABEL,
        x - 5,
        lineY + 4
      )
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

      if (ci.fitness == c0.fitness) {
        equal.push(ci)
      } else if (ci.fitness < c0.fitness) {
        less.push(ci)
      } else {
        more.push(ci)
      }
    }

    return quickSort(more).concat(equal).concat(quickSort(less))
  }

  function stabilizeNodesAndMuscles(
    nodes: Node[],
    muscles: Muscle[],
    nodeCount: number,
    muscleCount: number
  ): void {
    for (let j = 0; j < 200; j++) {
      for (let i = 0; i < muscleCount; i++) {
        simulation.applyForceToMuscle(muscles[i], nodes)
      }

      for (let i = 0; i < nodeCount; i++) {
        simulation.applyForcesToNode(nodes[i])
      }
    }

    for (let i = 0; i < nodeCount; i++) {
      const ni = nodes[i]
      ni.vx = 0
      ni.vy = 0
    }
  }

  function adjustNodesToCenter(nodes: Node[], nodeCount: number): void {
    let avx = 0
    let lowY = -1000

    for (let i = 0; i < nodeCount; i++) {
      const ni = nodes[i]
      avx += ni.x

      if (ni.y + ni.m / 2 > lowY) {
        lowY = ni.y + ni.m / 2
      }
    }

    avx /= nodeCount

    for (let i = 0; i < nodeCount; i++) {
      const ni = nodes[i]
      ni.x -= avx
      ni.y -= lowY
    }
  }

  function simulate(): void {
    for (let i = 0; i < simulationState.creature.muscles.length; i++) {
      const {muscles, nodes} = simulationState.creature
      simulation.applyForceToMuscle(muscles[i], nodes)
    }

    for (let i = 0; i < simulationState.creature.nodes.length; i++) {
      const ni = simulationState.creature.nodes[i]
      simulation.applyGravityToNode(ni)
      simulation.applyForcesToNode(ni)
      simulation.applyCollisionsToNode(ni)
      simulation.processNodeAxons(ni, simulationState.creature.nodes)
    }

    for (let i = 0; i < simulationState.creature.nodes.length; i++) {
      simulationState.creature.nodes[i].realizeMathValues()
    }

    simulationState.creature.averageNodeNausea =
      simulationState.creature.totalNodeNausea /
      simulationState.creature.nodes.length
    simulationState.timer++
    appState.viewTimer++
  }

  function getNodesAverage(nodes: Node[]): {
    averageX: number
    averageY: number
  } {
    let averageX = 0
    let averageY = 0

    for (let i = 0; i < nodes.length; i++) {
      const ni = nodes[i]
      averageX += ni.x
      averageY += ni.y
    }

    averageX = averageX / nodes.length
    averageY = averageY / nodes.length

    return {averageX, averageY}
  }

  p5.mouseWheel = (event: WheelEvent) => {
    const delta = event.deltaX

    if (appState.currentActivityId === Activity.SimulationRunning) {
      if (delta < 0) {
        simulationState.camera.zoom *= 0.9090909

        if (simulationState.camera.zoom < 0.002) {
          simulationState.camera.zoom = 0.002
        }

        p5.textFont(font, postFontSize)
      } else if (delta > 0) {
        simulationState.camera.zoom *= 1.1

        if (simulationState.camera.zoom > 0.1) {
          simulationState.camera.zoom = 0.1
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
      appState.currentActivityId === Activity.GenerationView &&
      generationCount >= 1 &&
      generationSlider.isUnderCursor()
    ) {
      draggingSlider = true
    }
  }

  function setActivity(m: Activity): void {
    appState.currentActivityId = m

    if (m === Activity.GenerationView) {
      drawGraph(975, 570)
    }
  }

  function startASAP(): void {
    setActivity(Activity.RequestingSimulation)
    creaturesTested = 0
    stepByStep = false
    stepByStepSlow = false
  }

  p5.mouseReleased = () => {
    draggingSlider = false
    // When the popup simulation is running, mouse clicks will stop it.
    appState.showPopupSimulation = false

    if (
      appState.currentActivityId === Activity.Start &&
      startViewStartButton.isUnderCursor()
    ) {
      startViewStartButton.onClick()
    } else if (
      appState.currentActivityId === Activity.GenerationView &&
      generationCount == -1 &&
      generationViewCreateButton.isUnderCursor()
    ) {
      generationViewCreateButton.onClick()
    } else if (
      appState.currentActivityId === Activity.GenerationView &&
      generationCount >= 0
    ) {
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
      appState.currentActivityId === Activity.GeneratedCreatures &&
      generatedCreaturesBackButton.isUnderCursor()
    ) {
      generatedCreaturesBackButton.onClick()
    } else if (
      appState.currentActivityId === Activity.FinishedStepByStep &&
      sortCreaturesButton.isUnderCursor()
    ) {
      sortCreaturesButton.onClick()
    } else if (
      appState.currentActivityId === Activity.SimulationRunning ||
      appState.currentActivityId === Activity.RequestingSimulation
    ) {
      if (stepByStepSkipButton.isUnderCursor()) {
        stepByStepSkipButton.onClick()
      } else if (stepByStepPlaybackSpeedButton.isUnderCursor()) {
        stepByStepPlaybackSpeedButton.onClick()
      } else if (stepByStepFinishButton.isUnderCursor()) {
        stepByStepFinishButton.onClick()
      }
    } else if (
      appState.currentActivityId === Activity.SortingCreatures &&
      sortingCreaturesSkipButton.isUnderCursor()
    ) {
      sortingCreaturesSkipButton.onClick()
    } else if (
      appState.currentActivityId === Activity.SortedCreatures &&
      cullCreaturesButton.isUnderCursor()
    ) {
      cullCreaturesButton.onClick()
    } else if (
      appState.currentActivityId === Activity.CulledCreatures &&
      propagateCreaturesButton.isUnderCursor()
    ) {
      propagateCreaturesButton.onClick()
    } else if (
      appState.currentActivityId === Activity.PropagatedCreatures &&
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

    appState.viewTimer = 0
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

  function drawCreature(
    cj: Creature,
    x: number,
    y: number,
    toImage: number
  ): void {
    drawCreaturePieces(cj.nodes, cj.muscles, x, y, toImage)
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
      windowWidth * WINDOW_SIZE_MULTIPLIER,
      windowHeight * WINDOW_SIZE_MULTIPLIER
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
    p5.scale(WINDOW_SIZE_MULTIPLIER)

    if (appState.currentActivityId === Activity.Start) {
      p5.background(255)
      p5.noStroke()
      p5.fill(0)
      p5.text('EVOLUTION!', windowWidth / 2, 200)
      startViewStartButton.draw()
    } else if (appState.currentActivityId === Activity.GenerationView) {
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
        p5.text('Median ' + FITNESS_LABEL, 50, 160)
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
            FITNESS_UNIT_LABEL,
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
    } else if (appState.currentActivityId === Activity.GeneratingCreatures) {
      p5.background(220, 253, 102)
      p5.push()
      p5.scale(10.0 / scaleToFixBug)

      for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 40; x++) {
          const nodes: Node[] = []
          const muscles: Muscle[] = []

          const nodeNum = p5.int(p5.random(3, 6))
          const muscleNum = p5.int(p5.random(nodeNum - 1, nodeNum * 3 - 6))

          for (let i = 0; i < nodeNum; i++) {
            nodes.push(
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

            muscles.push(
              new Muscle(taxon, tc1, tc2, len, p5.random(0.02, 0.08))
            )
          }

          stabilizeNodesAndMuscles(nodes, muscles, nodeNum, muscleNum)
          adjustNodesToCenter(nodes, nodeNum)

          const heartbeat = p5.random(40, 80)
          const creature = new Creature(
            y * 40 + x + 1,
            nodes,
            muscles,
            0,
            true,
            heartbeat,
            1.0
          )

          c[y * 40 + x] = creature

          drawCreature(creature, x * 3 + 5.5, y * 2.5 + 3, 0)

          simulation.resolveCreatureIssues(creature)
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
    } else if (appState.currentActivityId === Activity.RequestingSimulation) {
      setSimulationState(c[creaturesTested])
      simulationState.camera.zoom = 0.01

      setActivity(Activity.SimulationRunning)

      if (!stepByStepSlow) {
        for (let i = 0; i < CREATURE_COUNT; i++) {
          setSimulationState(c[i])

          for (let s = 0; s < 900; s++) {
            simulate()
          }

          setFitness(i)
        }

        setActivity(Activity.SimulationFinished)
      }
    }

    const {averageX, averageY} = getNodesAverage(simulationState.creature.nodes)

    if (appState.currentActivityId === Activity.SimulationRunning) {
      // simulate running

      if (appState.viewTimer <= 900) {
        p5.background(120, 200, 255)

        for (let s = 0; s < simulationState.speed; s++) {
          if (appState.viewTimer < 900) {
            simulate()
          }
        }

        if (simulationState.speed < 30) {
          for (let s = 0; s < simulationState.speed; s++) {
            simulationState.camera.x +=
              (averageX - simulationState.camera.x) * 0.06
            simulationState.camera.y +=
              (averageY - simulationState.camera.y) * 0.06
          }
        } else {
          simulationState.camera.x = averageX
          simulationState.camera.y = averageY
        }

        p5.push()

        p5.translate(p5.width / 2.0, p5.height / 2.0)
        p5.scale(1.0 / simulationState.camera.zoom / scaleToFixBug)
        p5.translate(
          -simulationState.camera.x * scaleToFixBug,
          -simulationState.camera.y * scaleToFixBug
        )

        drawPosts(0)
        drawGround(0)
        drawCreaturePieces(
          simulationState.creature.nodes,
          simulationState.creature.muscles,
          0,
          0,
          0
        )
        drawArrow(averageX)

        p5.pop()

        drawStats(windowWidth - 10, 0, 0.7)

        stepByStepSkipButton.draw()
        stepByStepPlaybackSpeedButton.draw()
        stepByStepFinishButton.draw()
      }

      if (appState.viewTimer == 900) {
        if (simulationState.speed < 30) {
          // When the simulation speed is slow enough, display the creature's fitness.
          p5.noStroke()
          p5.fill(0, 0, 0, 130)
          p5.rect(0, 0, windowWidth, windowHeight)
          p5.fill(0, 0, 0, 255)
          p5.rect(windowWidth / 2 - 500, 200, 1000, 240)
          p5.fill(255, 0, 0)
          p5.textAlign(p5.CENTER)
          p5.textFont(font, 96)
          p5.text("Creature's " + FITNESS_LABEL + ':', windowWidth / 2, 300)
          p5.text(
            p5.nf(averageX * 0.2, 0, 2) + ' ' + FITNESS_UNIT_LABEL,
            windowWidth / 2,
            400
          )
        } else {
          // When the simulation speed is too fast, skip ahead to next simulation using the timer.
          appState.viewTimer = 1020
        }

        setFitness(creaturesTested)
      }

      if (appState.viewTimer >= 1020) {
        setActivity(Activity.RequestingSimulation)

        creaturesTested++
        if (creaturesTested == CREATURE_COUNT) {
          setActivity(Activity.SimulationFinished)
        }

        simulationState.camera.x = 0
      }

      if (appState.viewTimer >= 900) {
        appState.viewTimer += simulationState.speed
      }
    }

    if (appState.currentActivityId === Activity.SimulationFinished) {
      // sort

      c2 = new Array<Creature>(0)

      for (let i = 0; i < CREATURE_COUNT; i++) {
        c2.push(c[i])
      }

      c2 = quickSort(c2)

      fitnessPercentileHistory.push(new Array<number>(fitnessPercentileCount))
      for (let i = 0; i < fitnessPercentileCount; i++) {
        fitnessPercentileHistory[generationCount + 1][i] =
          c2[fitnessPercentileCreatureIndices[i]].fitness
      }

      creatureDatabase.push(c2[lastCreatureIndex].clone())
      creatureDatabase.push(c2[midCreatureIndex].clone())
      creatureDatabase.push(c2[0].clone())

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
        const bar = p5.floor(c2[i].fitness * histBarsPerMeter - minBar)

        if (bar >= 0 && bar < barLen) {
          barCounts[generationCount + 1][bar]++
        }

        const species =
          (c2[i].nodes.length % 10) * 10 + (c2[i].muscles.length % 10)
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

      if (stepByStep) {
        drawScreenImage(0)
        setActivity(Activity.FinishedStepByStep)
      } else {
        setActivity(Activity.CullingCreatures)
      }
    }

    if (appState.currentActivityId === Activity.SortingCreatures) {
      // cool sorting animation

      p5.background(220, 253, 102)
      p5.push()
      p5.scale(10.0 / scaleToFixBug)

      const transition =
        0.5 - 0.5 * p5.cos(p5.min(appState.viewTimer / 60, p5.PI))

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

      if (stepByStepSlow) {
        appState.viewTimer += 2
      } else {
        appState.viewTimer += 10
      }

      sortingCreaturesSkipButton.draw()

      if (appState.viewTimer > 60 * p5.PI) {
        drawScreenImage(1)
        setActivity(Activity.SortedCreatures)
      }
    }

    const {mX, mY} = getCursorPosition()

    if (
      (appState.currentActivityId === Activity.FinishedStepByStep ||
        appState.currentActivityId === Activity.SortingCreatures ||
        appState.currentActivityId === Activity.SortedCreatures ||
        appState.currentActivityId === Activity.CullingCreatures ||
        appState.currentActivityId === Activity.CulledCreatures) &&
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
          appState.currentActivityId === Activity.FinishedStepByStep &&
          p5.abs(mY - 329) <= 312
        ) {
          idOfCreatureUnderCursor =
            creaturesInPosition[
              p5.floor((mX - 40) / 30) + p5.floor((mY - 17) / 25) * 40
            ]
        } else if (
          (appState.currentActivityId === Activity.SortedCreatures ||
            appState.currentActivityId === Activity.CullingCreatures ||
            appState.currentActivityId === Activity.CulledCreatures) &&
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
      appState.currentActivityId === Activity.GenerationView &&
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

    if (appState.currentActivityId === Activity.CullingCreatures) {
      // Cull Creatures

      for (let i = 0; i < 500; i++) {
        const fitnessRankSurvivalChance = i / CREATURE_COUNT
        const cullingThreshold = (p5.pow(p5.random(-1, 1), 3) + 1) / 2 // cube function

        let survivingCreatureIndex
        let culledCreatureIndex

        if (fitnessRankSurvivalChance <= cullingThreshold) {
          survivingCreatureIndex = i
          culledCreatureIndex = lastCreatureIndex - i
        } else {
          survivingCreatureIndex = lastCreatureIndex - i
          culledCreatureIndex = i
        }

        const survivingCreature = c2[survivingCreatureIndex]
        survivingCreature.alive = true

        const culledCreature = c2[culledCreatureIndex]
        culledCreature.alive = false
      }

      if (stepByStep) {
        drawScreenImage(2)
        setActivity(Activity.CulledCreatures)
      } else {
        setActivity(Activity.PropagatingCreatures)
      }
    }

    if (appState.currentActivityId === Activity.PropagatingCreatures) {
      // Reproduce and mutate

      for (let j = 0; j < 500; j++) {
        let j2 = j
        if (!c2[j].alive) {
          j2 = lastCreatureIndex - j
        }

        const cj = c2[j2]
        const cj2 = c2[lastCreatureIndex - j2]

        c2[j2] = cj.clone(cj.id + CREATURE_COUNT)
        c2[lastCreatureIndex - j2] = simulation.modifyCreature(
          cj,
          cj2.id + CREATURE_COUNT
        ) // mutated offspring 1

        const nodes = c2[lastCreatureIndex - j2].nodes
        const muscles = c2[lastCreatureIndex - j2].muscles

        stabilizeNodesAndMuscles(nodes, muscles, nodes.length, muscles.length)
        adjustNodesToCenter(nodes, nodes.length)
      }

      for (let j = 0; j < CREATURE_COUNT; j++) {
        const cj = c2[j]
        c[cj.id - generationCount * CREATURE_COUNT - (CREATURE_COUNT + 1)] =
          cj.clone()
      }

      drawScreenImage(3)

      generationCount++

      if (stepByStep) {
        setActivity(Activity.PropagatedCreatures)
      } else {
        setActivity(Activity.GenerationView)
      }
    }

    if (
      appState.currentActivityId === Activity.FinishedStepByStep ||
      appState.currentActivityId === Activity.SortedCreatures ||
      appState.currentActivityId === Activity.CulledCreatures ||
      appState.currentActivityId === Activity.PropagatedCreatures
    ) {
      p5.image(screenImage, 0, 0, windowWidth, windowHeight)
    }

    if (
      appState.currentActivityId === Activity.GenerationView ||
      gensToDo >= 1
    ) {
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
      simulationState.timer = 0

      if (gensToDo == 0) {
        // The full simulation is not running, so the popup simulation can be shown.
        appState.showPopupSimulation = true

        setSimulationState(creature)
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
    p5.text('Creature ID: ' + simulationState.creature.id, 0, 32)

    let timeShow: number
    if (simulationState.speed > 60) {
      timeShow = p5.int((appState.viewTimer + creaturesTested * 37) / 60) % 15
    } else {
      timeShow = appState.viewTimer / 60
    }

    p5.text('Time: ' + p5.nf(timeShow, 0, 2) + ' / 15 sec.', 0, 64)
    p5.text('Playback Speed: x' + p5.max(1, simulationState.speed), 0, 96)

    const {averageX, averageY} = getNodesAverage(simulationState.creature.nodes)

    p5.text('X: ' + p5.nf(averageX / 5.0, 0, 2) + '', 0, 128)
    p5.text('Y: ' + p5.nf(-averageY / 5.0, 0, 2) + '', 0, 160)
    p5.text(
      'Energy used: ' +
        p5.nf(simulationState.creature.energyUsed, 0, 2) +
        ' yums',
      0,
      192
    )
    p5.text(
      'A.N.Nausea: ' +
        p5.nf(simulationState.creature.averageNodeNausea, 0, 2) +
        ' blehs',
      0,
      224
    )

    p5.pop()
  }

  function setSimulationState(simulationCreature: Creature): void {
    simulationState.creature.nodes = simulationCreature.nodes.map(node =>
      node.clone()
    )
    simulationState.creature.muscles = simulationCreature.muscles.map(muscle =>
      muscle.clone()
    )

    appState.viewTimer = 0
    simulationState.creature.id = simulationCreature.id
    simulationState.camera.zoom = 0.01
    simulationState.camera.x = 0
    simulationState.camera.y = 0
    simulationState.timer = 0
    simulationState.creature.energyUsed = baselineEnergy
    simulationState.creature.totalNodeNausea = 0
    simulationState.creature.averageNodeNausea = 0
  }

  function setFitness(i: number): void {
    const {averageX} = getNodesAverage(simulationState.creature.nodes)
    c[i].fitness = averageX * 0.2 // Multiply by 0.2 because a meter is 5 units for some weird reason.
  }
}
