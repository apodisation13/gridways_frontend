import { markRaw } from "vue"
import { POSITION, useToast } from "vue-toastification"

import AchievementRewardToast from "@/components/Pages/AchievementsPage/AchievementRewardToast.vue"
import store from "@/store"

const REWARD_PREFIX = "achievement-reward:"
const MAX_VISIBLE_REWARDS = 3
const REWARD_TIMEOUT_MS = 6000

// filterToasts вызывается самим тостером. Невидимые награды остаются в его очереди,
// их таймеры начнут работать только после появления на экране.
export function filterAchievementRewardToasts<
  T extends { id?: string | number },
>(toasts: T[]): T[] {
  const isReward = (toast: T) => String(toast.id).startsWith(REWARD_PREFIX)
  const rewards = toasts.filter(isReward).slice(0, MAX_VISIBLE_REWARDS)
  // Контейнер по умолчанию разворачивает список (newestOnTop).
  // Награды разворачиваем заранее: первая сверху, новые под ней.
  // Обычные тосты сохраняют свой порядок и не занимают лимит наград.
  return [...toasts.filter(toast => !isReward(toast)), ...rewards.reverse()]
}

export function installAchievementRewardToasts(): () => void {
  const toast = useToast()
  const scheduled = new Set<string>()

  function showQueuedRewards(): void {
    for (const reward of store.state.achievements.grantedRewards) {
      const id = REWARD_PREFIX + reward.notification_id
      if (scheduled.has(id)) continue
      scheduled.add(id)
      toast.success(
        {
          component: markRaw(AchievementRewardToast),
          props: { title: reward.title, resources: reward.rewards.resources },
        },
        {
          id,
          position: POSITION.TOP_RIGHT,
          toastClassName: "achievement-reward-notification",
          timeout: REWARD_TIMEOUT_MS,
          closeOnClick: false,
          pauseOnHover: true,
          pauseOnFocusLoss: true,
          draggable: true,
          onClose: () => {
            scheduled.delete(id)
            store.commit("dismissAchievementReward", reward.notification_id)
          },
        }
      )
    }
  }

  function clearRewardToasts(): void {
    // Закрываем только награды текущего пользователя, обычные сообщения не трогаем.
    for (const id of [...scheduled]) toast.dismiss(id)
    scheduled.clear()
  }

  const unsubscribe = store.subscribe(mutation => {
    if (mutation.type === "finishAchievementBatch") showQueuedRewards()
    if (mutation.type === "resetAchievementSession") clearRewardToasts()
  })
  showQueuedRewards()
  return () => {
    unsubscribe()
    clearRewardToasts()
  }
}
