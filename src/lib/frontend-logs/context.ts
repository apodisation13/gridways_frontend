import { defineComponent } from "vue"

import type { GameObj } from "@/types"

let activeGame: (() => GameObj) | undefined

// Each getter is isolated: a damaged field must not hide the other evidence.
export function readContextFields(fields: Record<string, () => unknown>) {
  const context: Record<string, unknown> = {}
  for (const [key, read] of Object.entries(fields)) {
    try {
      const value = read()
      if (value !== undefined) context[key] = value
    } catch {
      /* Omit only the unavailable field. */
    }
  }
  return context
}

function cardIds(cards: unknown) {
  if (!Array.isArray(cards)) return undefined
  return cards.slice(0, 100).map(card => {
    try {
      return typeof card?.id === "number" ? card.id : null
    } catch {
      return null
    }
  })
}

export function getCardContext() {
  let game: GameObj | undefined
  try {
    game = activeGame?.()
  } catch {
    return {}
  }
  if (!game) return {}
  const current = game
  return readContextFields({
    leader_id: () => current.leader?.id,
    enemy_leader_id: () => current.enemy_leader?.id,
    effects: () =>
      Array.isArray(current.effects)
        ? current.effects.slice(0, 100).map(effect =>
            effect
              ? readContextFields({
                  type: () => effect.type,
                  turns: () => effect.turns,
                  times_count: () => effect.times_count,
                  value: () => effect.value,
                })
              : null
          )
        : undefined,
    deck_card_ids: () => cardIds(current.deck),
    grave_card_ids: () => cardIds(current.grave),
    enemy_deck_card_ids: () => cardIds(current.enemies),
    enemy_grave_card_ids: () => cardIds(current.enemies_grave),
    hand_card_ids: () => cardIds(current.hand),
    field_card_ids: () => cardIds(current.field),
  })
}

// Read the current arrays only when an error occurs; no watchers or history.
const providers = new WeakMap<object, () => GameObj>()
export default defineComponent({
  created() {
    const provider = () => (this as unknown as { gameObj: GameObj }).gameObj
    providers.set(this, provider)
    activeGame = provider
  },
  unmounted() {
    if (activeGame === providers.get(this)) activeGame = undefined
    providers.delete(this)
  },
})
