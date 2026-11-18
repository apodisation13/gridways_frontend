import type { GrantedAchievementReward } from "@/types"
import { AchievementEventType } from "@/types"

import { trackAchievementEvent } from "./trackAchievementEvent"

// Ответ бэка содержит уже выданные суммы с учётом лимитов, а не обещания из конфига.
export function trackAchievementRewards(
  rewards: GrantedAchievementReward[]
): void {
  for (const reward of rewards) {
    const resources = Object.fromEntries(
      Object.entries(reward.rewards.resources).filter(
        ([, amount]) => Number.isFinite(amount) && amount > 0
      )
    )
    if (!Object.keys(resources).length) continue
    trackAchievementEvent({
      type: AchievementEventType.ResourceGained,
      data: { resources },
    })
  }
}
