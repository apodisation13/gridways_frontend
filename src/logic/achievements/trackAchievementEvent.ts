import { v4 as uuidv4 } from "uuid"

import store from "@/store"
import type { AchievementEvent, AchievementEventInput } from "@/types"
import { AchievementEventType } from "@/types"

/** Register a fact locally; the sync subscriber handles batch delivery. */
export function trackAchievementEvent(input: AchievementEventInput): string {
  let type: AchievementEvent["type"]
  let data: AchievementEvent["data"]

  if (input.type === AchievementEventType.ActionPlayed) {
    const actor = input.actor
    if ("color" in actor) {
      type = AchievementEventType.CardPlayed
      data = { cardId: actor.id, rarity: actor.color.toLowerCase() }
    } else {
      type = AchievementEventType.LeaderPlayed
      data = { leaderId: actor.id }
    }
  } else {
    type = input.type
    data = { ...input.data }
  }

  // Store only scalar facts, never the mutable card/leader object.
  const event: AchievementEvent = { id: uuidv4(), type, data }
  store.commit("enqueueAchievementEvent", event)
  return event.id
}
