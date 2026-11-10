import store from "@/store"

import { processAchievementEvents } from "./processAchievementEvents"

const FLUSH_INTERVAL_MS = 10_000
const MAX_PENDING_EVENTS = 20

/** Install once for the lifetime of the app. Sent batches are never retried. */
export function installAchievementSync(): () => void {
  function shouldFlush(): boolean {
    const state = store.state.achievements
    if (!state.pendingEvents.length) return false
    if (state.pendingEvents.length >= MAX_PENDING_EVENTS) return true

    // Only a goal reached by waiting events should trigger another request.
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
    if (sent && shouldFlush()) void flush()
  }

  const unsubscribe = store.subscribe(mutation => {
    if (mutation.type === "logOut" || mutation.type === "logIn") {
      store.commit("resetAchievementSession")
    } else if (mutation.type === "enqueueAchievementEvent" && shouldFlush()) {
      void flush()
    }
  })
  const timer = setInterval(() => void flush(), FLUSH_INTERVAL_MS)

  return () => {
    clearInterval(timer)
    unsubscribe()
    store.commit("resetAchievementSession")
  }
}
