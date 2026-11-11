import store from "@/store"
import { AchievementEventType } from "@/types"

import { checkCurrentResources } from "./currentResources"
import { processAchievementEvents } from "./processAchievementEvents"

const FLUSH_INTERVAL_MS = 10_000
const MAX_PENDING_EVENTS = 20

// Подключается один раз в main.ts. Здесь решаем КОГДА отправить, сам запрос — в store.
export function installAchievementSync(): () => void {
  let loaded = new Set<string>()
  let initialCheckDone = false

  function shouldFlush(): boolean {
    const state = store.state.achievements
    if (!state.pendingEvents.length) return false
    if (
      state.pendingEvents.some(
        event => event.type === AchievementEventType.ResourcesChecked
      )
    )
      return true
    if (state.pendingEvents.length >= MAX_PENDING_EVENTS) return true

    // before — прогресс с учётом уже отправленной пачки.
    // after — добавляем к нему новые ходы из очереди.
    // Если именно новые ходы довели задание до цели, ждать таймера не нужно.
    const before = processAchievementEvents(
      state.achievementsConfig.permanent,
      state.userAchievements,
      state.inFlightEvents
    )
    const after = processAchievementEvents(
      state.achievementsConfig.permanent,
      before.progress,
      state.pendingEvents
    )
    return after.reachedAchievementIds.length > 0
  }

  async function flush(): Promise<void> {
    const sent = await store.dispatch("sendAchievementEvents")
    // Пока ждали ответ, могли накопиться ещё 20 событий или выполниться другая цель.
    // Проверяем их сразу. Если action не запустил запрос, повторно его не вызываем.
    if (sent && shouldFlush()) void flush()
  }

  const unsubscribe = store.subscribe(mutation => {
    if (
      ["set_resource", "setUserAchievements", "setAchievementsConfig"].includes(
        mutation.type
      )
    ) {
      loaded.add(mutation.type)
      if (!initialCheckDone && loaded.size === 3) {
        initialCheckDone = true
        checkCurrentResources()
      }
    }
    if (mutation.type === "logOut" || mutation.type === "logIn") {
      loaded = new Set<string>()
      initialCheckDone = false
      store.commit("resetAchievementSession")
    } else if (mutation.type === "enqueueAchievementEvent" && shouldFlush()) {
      // Проверка после каждого нового события: цель достигнута или очередь заполнена.
      void flush()
    }
  })
  // Это регулярный таймер, новые ходы не отодвигают его. Пустую очередь action пропустит.
  const timer = setInterval(() => void flush(), FLUSH_INTERVAL_MS)

  // Функция отключения подписки и таймера, если понадобится остановить синхронизацию.
  return () => {
    clearInterval(timer)
    unsubscribe()
    store.commit("resetAchievementSession")
  }
}
