import { v4 as uuidv4 } from "uuid"

import store from "@/store"
import type { AchievementEvent, AchievementEventInput } from "@/types"
import { AchievementEventType } from "@/types"

// Общая точка входа из игры: сообщаем, что произошло, без перечисления заданий.
// Подсчёт выполняется отдельно, а отправку очереди организует syncAchievementEvents.
export function trackAchievementEvent(input: AchievementEventInput): string {
  // Снимок всех JSON-полей, включая вложенные объекты и массивы.
  // Более поздние изменения игровой карты не должны менять уже записанное событие.
  // undefined, как и при обычной отправке JSON, не сохраняется в полях объекта.
  const data: AchievementEvent["data"] = JSON.parse(
    JSON.stringify(
      input.type === AchievementEventType.ActionPlayed
        ? { actor: input.actor }
        : input.data
    )
  )
  const event: AchievementEvent = { id: uuidv4(), type: input.type, data }
  store.commit("enqueueAchievementEvent", event)
  return event.id
}
