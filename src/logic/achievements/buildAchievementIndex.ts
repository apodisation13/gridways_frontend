import type { AchievementsByEvent, AchievementSection } from "@/types"
import { AchievementCounterType } from "@/types"

// Вызывается при получении конфига, а не при каждом событии или показе прогресса.
export function buildAchievementIndex(
  section: AchievementSection
): AchievementsByEvent {
  const byEvent: AchievementsByEvent = new Map()
  for (const category of Object.values(section.categories)) {
    for (const definition of Object.values(category.achievements)) {
      const types = new Set([definition.event])
      if (definition.counter.type === AchievementCounterType.Streak) {
        for (const reset of definition.counter.reset) types.add(reset.event)
      }
      // Set исключает дубли: одно событие может и продвигать, и сбрасывать серию.
      for (const type of types) {
        const definitions = byEvent.get(type) ?? []
        definitions.push(definition)
        byEvent.set(type, definitions)
      }
    }
  }
  return byEvent
}
