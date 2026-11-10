export type AchievementPeriod = "permanent" | "daily" | "weekly"

export type AchievementCounter =
  | { type: "count" }
  | { type: "sum" | "distinct" | "max"; field: string }

export interface AchievementRewards {
  resources: Record<string, number>
}

export interface AchievementDefinition {
  id: string
  ordering: number
  title: string
  event: string
  filters: Record<string, string | number | boolean>
  counter: AchievementCounter
  target: number
  rewards: AchievementRewards
}

export interface AchievementCategory {
  id: string
  title: string
  ordering: number
  achievements: Record<string, AchievementDefinition>
}

export interface AchievementSection {
  title: string
  categories: Record<string, AchievementCategory>
}

// GAME_DATA includes only permanent achievements. Selected recurring sets
// will be loaded separately and must not be erased by catalog refreshes.
export interface AchievementGameConfig {
  permanent: AchievementSection
}

export interface AchievementCatalog extends AchievementGameConfig {
  daily: AchievementSection | null
  weekly: AchievementSection | null
}

export interface AchievementProgress {
  value: number
  seen?: Array<string | number>
  completed_at: string | null
  reward_granted_at: string | null
}

export interface PeriodAchievementProgress {
  period: string
  tasks: Record<string, AchievementProgress>
}

export interface UserAchievementsProgress {
  permanent?: Record<string, AchievementProgress>
  daily?: PeriodAchievementProgress
  weekly?: PeriodAchievementProgress
}
