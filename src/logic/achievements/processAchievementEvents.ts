import type {
  AchievementDefinition,
  AchievementEvent,
  AchievementPreview,
  AchievementRecordedEventType,
  AchievementSection,
  UserAchievementsProgress,
} from "@/types"
import { AchievementCounterType } from "@/types"

/** Replay pending events over confirmed progress without modifying either input.
 * Only permanent count/sum goals are supported at this stage. Recurring goals
 * need their selected set and period before they can be evaluated safely.
 */
export function processAchievementEvents(
  section: AchievementSection,
  confirmedProgress: UserAchievementsProgress,
  events: readonly AchievementEvent[]
): AchievementPreview {
  const progress: UserAchievementsProgress = { ...confirmedProgress }
  if (confirmedProgress.permanent) {
    progress.permanent = { ...confirmedProgress.permanent }
  }
  const byEvent = new Map<
    AchievementRecordedEventType,
    AchievementDefinition[]
  >()
  for (const category of Object.values(section.categories)) {
    for (const definition of Object.values(category.achievements)) {
      const definitions = byEvent.get(definition.event) ?? []
      definitions.push(definition)
      byEvent.set(definition.event, definitions)
    }
  }

  const processedIds = new Set<string>()
  const reachedIds = new Set<string>()
  for (const event of events) {
    if (processedIds.has(event.id)) continue
    processedIds.add(event.id)

    for (const definition of byEvent.get(event.type) ?? []) {
      if (!Number.isFinite(definition.target) || definition.target <= 0)
        continue
      if (
        !Object.entries(definition.filters).every(
          ([field, expected]) =>
            Object.prototype.hasOwnProperty.call(event.data, field) &&
            event.data[field] === expected
        )
      )
        continue

      const current = progress.permanent?.[definition.id]
      if (current?.completed_at || current?.reward_granted_at) continue
      const value = current?.value ?? 0
      if (value >= definition.target) continue

      let increment: number
      if (definition.counter.type === AchievementCounterType.Count) {
        increment = 1
      } else if (definition.counter.type === AchievementCounterType.Sum) {
        const amount = event.data[definition.counter.field]
        if (
          typeof amount !== "number" ||
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          continue
        }
        increment = amount
      } else {
        // Ignore unsupported counter types from runtime configuration.
        continue
      }

      const nextValue = Math.min(definition.target, value + increment)
      progress.permanent ??= {}
      progress.permanent[definition.id] = {
        ...current,
        value: nextValue,
        completed_at: current?.completed_at ?? null,
        reward_granted_at: current?.reward_granted_at ?? null,
      }
      if (nextValue >= definition.target) reachedIds.add(definition.id)
    }
  }

  return { progress, reachedAchievementIds: [...reachedIds] }
}
