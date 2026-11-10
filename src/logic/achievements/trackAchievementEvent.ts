import { v4 as uuidv4 } from "uuid"

import store from "@/store"
import type { AchievementEvent, AchievementEventInput } from "@/types"
import { AchievementEventType } from "@/types"

// Общая точка входа из игры: сообщаем, что произошло, без перечисления заданий.
// Подсчёт выполняется отдельно, а отправку очереди организует syncAchievementEvents.
export function trackAchievementEvent(input: AchievementEventInput): string {
  let type: AchievementEvent["type"]
  let data: AchievementEvent["data"]

  if (input.type === AchievementEventType.ActionPlayed) {
    // Вызывающий код передаёт actor целиком и не проверяет, карта это или лидер.
    const actor = input.actor
    if ("color" in actor) {
      // У карты есть цвет. Приводим Bronze/Silver/Gold к значениям из конфига.
      type = AchievementEventType.CardPlayed
      data = { cardId: actor.id, rarity: actor.color.toLowerCase() }
    } else {
      // У лидера цвета нет. Одно применение его заряда — отдельное событие.
      type = AchievementEventType.LeaderPlayed
      data = { leaderId: actor.id }
    }
  } else {
    // Уже готовые события (например, расход ресурса) берём с переданными data.
    type = input.type
    data = { ...input.data }
  }

  // В очереди остаются простые значения, а не ссылка на изменяемую игровую карту.
  // ID нужен только локально; в запрос на бэк он не попадёт.
  const event: AchievementEvent = { id: uuidv4(), type, data }
  // После добавления подписчик проверит, не пора ли сразу отправить пачку.
  store.commit("enqueueAchievementEvent", event)
  return event.id
}
