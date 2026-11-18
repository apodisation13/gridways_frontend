import type { Enemy, EnemyLeader } from "@/types"
import { AchievementEventType } from "@/types"

import { trackAchievementEvent } from "./trackAchievementEvent"

// before — независимый снимок до эффекта, включая статус и завещание.
// Сам эффект не меняем: только измеряем снятые щит и броню.
export function trackEnemyDefenceChanges(
  before: Enemy | EnemyLeader,
  after: Enemy | EnemyLeader
): void {
  if (before.data.shield && !after.data.shield) {
    trackAchievementEvent({
      type: AchievementEventType.EnemyShieldRemoved,
      enemy: before,
    })
  }
  const previous = before.data.armor ?? 0
  const current = after.data.armor ?? 0
  if (!Number.isFinite(previous) || !Number.isFinite(current)) return
  const amount = Math.max(0, previous) - Math.max(0, current)
  if (amount > 0) {
    trackAchievementEvent({
      type: AchievementEventType.EnemyArmorRemoved,
      enemy: before,
      amount,
    })
  }
}
