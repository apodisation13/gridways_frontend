import store from "@/store"
import type { AchievementsByEvent, UserAchievementsProgress } from "@/types"
import { AchievementEventType } from "@/types"

import { processAchievementEvents } from "./processAchievementEvents"
import { trackAchievementEvent } from "./trackAchievementEvent"

// Для отображения берём живой баланс. Этот снимок существует только на фронте.
export function previewCurrentResources(
  byEvent: AchievementsByEvent,
  progress: UserAchievementsProgress,
  resources: Record<string, number>
) {
  return processAchievementEvents(byEvent, progress, [
    {
      id: "current-resource-preview",
      type: AchievementEventType.ResourcesChecked,
      data: { resources },
    },
  ])
}

// Вызывается централизованно после отслеживаемой операции и при загрузке.
// Баланс на сервер не отправляем: там он будет прочитан из БД.
export function checkCurrentResources(): string[] {
  const state = store.state.achievements
  if (!store.getters.isLoggedIn) return []
  if (!state.achievementsByEvent.has(AchievementEventType.ResourcesChecked))
    return []
  const preview = previewCurrentResources(
    state.achievementsByEvent,
    state.userAchievements,
    store.getters.resource
  )
  if (!preview.reachedAchievementIds.length) return []
  // Одного сигнала в очереди достаточно для проверки всех ресурсов.
  if (
    state.pendingEvents.some(
      event => event.type === AchievementEventType.ResourcesChecked
    )
  )
    return []
  return trackAchievementEvent({
    type: AchievementEventType.ResourcesChecked,
    data: {},
  })
}
