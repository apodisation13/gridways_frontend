import type {
  AchievementUpgradeSnapshot,
  AchievementUpgradeSummary,
} from "@/types"
import type { UpgradesConfig, UserUpgrades } from "@/types/upgrades"
import { UpgradeType } from "@/types/upgrades"

// Уровень — номер ступени; value — эффект этой ступени, например размер руки 12.
// Максимум определяем так же, как бэк при покупке: next === null.
export function buildUpgradeSnapshot(
  config: UpgradesConfig,
  user: UserUpgrades
): AchievementUpgradeSnapshot {
  const empty = (): AchievementUpgradeSummary => ({
    total_count: 0,
    maxed_count: 0,
    all_maxed: 0,
  })
  const snapshot: AchievementUpgradeSnapshot = {
    upgrades: {},
    summary: { all: empty(), non_settings: empty() },
  }
  for (const upgradeType of Object.values(UpgradeType)) {
    const items = config[upgradeType]?.upgrades
    if (!items) continue
    snapshot.upgrades[upgradeType] = {}
    const summary = empty()
    for (const [subtype, item] of Object.entries(items)) {
      summary.total_count++
      const level = user[upgradeType]?.[subtype] ?? 0
      const entry = item.upgrades[level]
      // Неизвестная ступень не считается максимумом и не исчезает из общего числа.
      if (!entry) continue
      const maxed = entry.next === null
      snapshot.upgrades[upgradeType][subtype] = {
        level,
        value: entry.value,
        maxed,
      }
      if (maxed) summary.maxed_count++
    }
    snapshot.summary[upgradeType] = summary
    for (const total of [
      snapshot.summary.all,
      ...(upgradeType !== UpgradeType.SETTINGS
        ? [snapshot.summary.non_settings]
        : []),
    ]) {
      total.total_count += summary.total_count
      total.maxed_count += summary.maxed_count
    }
  }
  for (const summary of Object.values(snapshot.summary)) {
    // Пустая категория не означает «все прокачано».
    summary.all_maxed = Number(
      summary.total_count > 0 && summary.maxed_count === summary.total_count
    )
  }
  return snapshot
}
