import type {
  AchievementDefinition,
  AchievementEvent,
  AchievementPreview,
  AchievementRecordedEventType,
  AchievementSection,
  UserAchievementsProgress,
} from "@/types"
import { AchievementCounterType } from "@/types"

// Считает предварительный прогресс, не меняя исходные данные и не выдавая наград.
// Пока поддерживаем постоянные задания с count и sum. Для daily/weekly нужны их периоды.
export function processAchievementEvents(
  section: AchievementSection,
  confirmedProgress: UserAchievementsProgress,
  events: readonly AchievementEvent[]
): AchievementPreview {
  // Работаем с копией: подтверждённые бэком значения должны остаться нетронутыми.
  const progress: UserAchievementsProgress = { ...confirmedProgress }
  if (confirmedProgress.permanent) {
    progress.permanent = { ...confirmedProgress.permanent }
  }
  // Собираем задания по типу события, чтобы для карты не проверять задания на ресурсы.
  // Категории нужны для страницы, в подсчёте ориентируемся на event и ID задания.
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

  // Одно событие учитываем один раз в этом расчёте. Это не защита от повторов на бэке.
  const processedIds = new Set<string>()
  // Цели, достигнутые при обработке этих событий: сигнал для немедленной отправки.
  const reachedIds = new Set<string>()
  for (const event of events) {
    if (processedIds.has(event.id)) continue
    processedIds.add(event.id)

    for (const definition of byEvent.get(event.type) ?? []) {
      if (!Number.isFinite(definition.target) || definition.target <= 0)
        continue
      // Все фильтры должны совпасть. Например, rarity: bronze пропустит серебряную карту.
      if (
        !Object.entries(definition.filters).every(
          ([field, expected]) =>
            Object.prototype.hasOwnProperty.call(event.data, field) &&
            event.data[field] === expected
        )
      )
        continue

      // Выполненное больше не растёт. Отсутствующая запись означает нулевой прогресс.
      const current = progress.permanent?.[definition.id]
      if (current?.completed_at || current?.reward_granted_at) continue
      const value = current?.value ?? 0
      if (value >= definition.target) continue

      let increment: number
      if (definition.counter.type === AchievementCounterType.Count) {
        // Одно событие — один шаг, например применение карты.
        increment = 1
      } else if (definition.counter.type === AchievementCounterType.Sum) {
        // Берём число из указанного поля: например, amount при расходе ресурса.
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
        // Если бэк прислал ещё не поддерживаемый способ подсчёта, пропускаем его.
        continue
      }

      // Показываем не больше цели: максимум 10/10, даже если событий было 12.
      const nextValue = Math.min(definition.target, value + increment)
      progress.permanent ??= {}
      progress.permanent[definition.id] = {
        ...current,
        value: nextValue,
        // Даты выполнения и выдачи награды устанавливает только бэк.
        completed_at: current?.completed_at ?? null,
        reward_granted_at: current?.reward_granted_at ?? null,
      }
      if (nextValue >= definition.target) reachedIds.add(definition.id)
    }
  }

  return { progress, reachedAchievementIds: [...reachedIds] }
}
