import store from "@/store"
import type { AchievementSection, UserAchievementsProgress } from "@/types"
import { AchievementEventType } from "@/types"
import type { UpgradesConfig, UserUpgrades } from "@/types/upgrades"

import { processAchievementEvents } from "./processAchievementEvents"
import { trackAchievementEvent } from "./trackAchievementEvent"
import { buildUpgradeSnapshot } from "./upgradeSnapshot"

export function previewCurrentUpgrades(
  section: AchievementSection,
  progress: UserAchievementsProgress,
  config: UpgradesConfig,
  user: UserUpgrades
) {
  const snapshot = buildUpgradeSnapshot(config, user)
  return processAchievementEvents(section, progress, [
    {
      id: "current-upgrades-preview",
      type: AchievementEventType.UpgradesChecked,
      // На фронте используем снимок для отображения. В запрос уйдёт только пустой сигнал.
      data: JSON.parse(JSON.stringify(snapshot)),
    },
  ])
}

export function checkCurrentUpgrades(): string[] {
  const state = store.state.achievements
  if (!store.getters.isLoggedIn) return []
  const preview = previewCurrentUpgrades(
    state.achievementsConfig.permanent,
    state.userAchievements,
    store.getters.upgradesConfig,
    store.getters.userUpgrades
  )
  if (!preview.reachedAchievementIds.length) return []
  if (
    state.pendingEvents.some(
      event => event.type === AchievementEventType.UpgradesChecked
    )
  )
    return []
  return trackAchievementEvent({
    type: AchievementEventType.UpgradesChecked,
    data: {},
  })
}
