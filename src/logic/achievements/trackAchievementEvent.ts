import { v4 as uuidv4 } from "uuid"

import store from "@/store"
import type { AchievementEvent, AchievementEventInput } from "@/types"
import { AchievementEventType } from "@/types"

// Общая точка входа из игры: сообщаем, что произошло, без перечисления заданий.
// Подсчёт выполняется отдельно, а отправку очереди организует syncAchievementEvents.
export function trackAchievementEvent(input: AchievementEventInput): string[] {
  if (input.type === AchievementEventType.ResourcesChanged) {
    const spent: Record<string, number> = {}
    const gained: Record<string, number> = {}
    for (const [resource, amount] of Object.entries(input.data.resources)) {
      if (!Number.isFinite(amount)) continue
      if (amount < 0) spent[resource] = -amount
      else if (amount > 0) {
        const before = input.data.before?.[resource]
        const after = input.data.after?.[resource]
        // Без обоих значений нельзя отличить запрошенный доход от реального.
        // Для уже известного фактического дохода есть прямой ResourceGained.
        if (
          typeof before !== "number" ||
          !Number.isFinite(before) ||
          typeof after !== "number" ||
          !Number.isFinite(after)
        )
          continue

        // Бэк уже применил лимиты. 4900 → 5000 при награде 1000 даёт только +100.
        // Разница точна для последовательных операций без посторонних изменений баланса.
        const received = Math.min(amount, Math.max(0, after - before))
        if (received > 0) gained[resource] = received
      }
    }

    // Вызывающий код передаёт весь словарь. Разделение нужно только здесь.
    // Пустые события не создаём; исходный словарь не изменяем.
    const ids: string[] = []
    if (Object.keys(spent).length) {
      ids.push(
        ...trackAchievementEvent({
          type: AchievementEventType.ResourceSpent,
          data: { resources: spent },
        })
      )
    }
    if (Object.keys(gained).length) {
      ids.push(
        ...trackAchievementEvent({
          type: AchievementEventType.ResourceGained,
          data: { resources: gained },
        })
      )
    }
    return ids
  }

  // Снимок всех JSON-полей КАРТЫ ИЛИ ЛИДЕРА, включая вложенные объекты и массивы.
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
  return [event.id]
}
