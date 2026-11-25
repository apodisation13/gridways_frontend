import store from "@/store"
import type { AchievementsByEvent, UserAchievementsProgress } from "@/types"
import { AchievementEventType } from "@/types"

import { processAchievementEvents } from "./processAchievementEvents"
import { trackAchievementEvent } from "./trackAchievementEvent"

export function previewCurrentDecks(
  byEvent: AchievementsByEvent,
  progress: UserAchievementsProgress,
  count: number
) {
  return processAchievementEvents(byEvent, progress, [
    {
      id: "current-decks-preview",
      type: AchievementEventType.DecksChecked,
      data: { decks: { count } },
    },
  ])
}

export function checkCurrentDecks(): string[] {
  const state = store.state.achievements
  if (!store.getters.isLoggedIn) return []
  // Базовая колода тоже находится в хранении и входит в количество.
  const preview = previewCurrentDecks(
    state.achievementsByEvent,
    state.userAchievements,
    store.getters.all_decks.length
  )
  if (!preview.reachedAchievementIds.length) return []
  if (
    state.pendingEvents.some(
      event => event.type === AchievementEventType.DecksChecked
    )
  )
    return []
  // Бэк сам прочитает количество из БД; клиентское число не отправляем.
  return trackAchievementEvent({
    type: AchievementEventType.DecksChecked,
    data: {},
  })
}
