import type {Image} from 'p5'

import type {Creature} from '../creatures'

const creatureImageCache = new WeakMap<Creature, Image>()

export function getCachedCreatureImage(creature: Creature): Image | null {
  return creatureImageCache.get(creature) || null
}

export function setCachedCreatureImage(creature: Creature, image: Image): void {
  creatureImageCache.set(creature, image)
}
