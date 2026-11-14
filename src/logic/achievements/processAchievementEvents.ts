import type {
  AchievementDefinition,
  AchievementEvent,
  AchievementPreview,
  AchievementRecordedEventType,
  AchievementSection,
  UserAchievementsProgress,
} from "@/types"
import { AchievementCounterType, AchievementEventType } from "@/types"

import { buildDeckSummary } from "./deckSummary"
import { getAchievementField, matchesAchievementFilters } from "./filters"

// Считает предварительный прогресс, не меняя исходные данные и не выдавая наград.
// Поддерживаем постоянные задания с count, sum, current, unique и streak. Для daily/weekly нужны их периоды.
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
      const types = new Set([definition.event])
      if (definition.counter.type === AchievementCounterType.Streak) {
        for (const reset of definition.counter.reset) types.add(reset.event)
      }
      for (const type of types) {
        const definitions = byEvent.get(type) ?? []
        definitions.push(definition)
        byEvent.set(type, definitions)
      }
    }
  }

  // Одно событие учитываем один раз в этом расчёте. Это не защита от повторов на бэке.
  const processedIds = new Set<string>()
  // Цели, достигнутые при обработке этих событий: сигнал для немедленной отправки.
  const reachedIds = new Set<string>()
  for (const event of events) {
    if (processedIds.has(event.id)) continue
    processedIds.add(event.id)
    let data = event.data
    if (event.type === AchievementEventType.DeckSaved) {
      const deck = data.deck
      if (!deck || typeof deck !== "object" || Array.isArray(deck)) continue
      // Вычисляем при обработке, как на бэке; переданной summary не доверяем.
      data = {
        ...data,
        deck: { ...deck, summary: buildDeckSummary(deck.cards) },
      }
    }

    if (event.type === AchievementEventType.GameWon) {
      // Колода из события победы: по её картам считаем summary (размер, цвета,
      // «все бронзовые» и т. п.) для фильтров контрактов на состав победившей колоды.
      const deck = data.starting_deck
      if (deck && typeof deck === "object" && !Array.isArray(deck)) {
        data = {
          ...data,
          starting_deck: { ...deck, summary: buildDeckSummary(deck.cards) },
        }
      }
    }

    for (const definition of byEvent.get(event.type) ?? []) {
      if (!Number.isFinite(definition.target) || definition.target <= 0)
        continue
      // Условия берём из конфига: обработчик не знает про цвет, фракцию или урон.

      // Выполненное больше не растёт. Отсутствующая запись означает нулевой прогресс.
      const current = progress.permanent?.[definition.id]
      if (current?.completed_at || current?.reward_granted_at) continue
      const value = current?.value ?? 0
      const isCurrent =
        definition.counter.type === AchievementCounterType.Current
      if (
        isCurrent &&
        event.type !== AchievementEventType.ResourcesChecked &&
        event.type !== AchievementEventType.UpgradesChecked &&
        event.type !== AchievementEventType.DecksChecked
      )
        continue
      if (!isCurrent && value >= definition.target) continue

      const counter = definition.counter
      let streak: number | undefined
      if (counter.type === AchievementCounterType.Streak) {
        if (
          !Number.isInteger(counter.length) ||
          counter.length <= 0 ||
          !Number.isInteger(definition.target)
        )
          continue
        // Сброс имеет приоритет, если событие совпало с обоими условиями.
        if (
          counter.reset.some(
            reset =>
              event.type === reset.event &&
              matchesAchievementFilters(data, reset.filters)
          )
        ) {
          if (current?.streak) {
            progress.permanent ??= {}
            progress.permanent[definition.id] = { ...current, streak: 0 }
          }
          continue
        }
      }
      if (
        event.type !== definition.event ||
        !matchesAchievementFilters(data, definition.filters)
      )
        continue

      let seen: Array<string | number> | undefined
      let increment: number
      if (counter.type === AchievementCounterType.Streak) {
        streak = (current?.streak ?? 0) + 1
        increment = streak >= counter.length ? 1 : 0
        if (increment) streak = 0 // Серии не перекрываются.
      } else if (definition.counter.type === AchievementCounterType.Count) {
        // Одно событие — один шаг, например применение карты.
        increment = 1
      } else if (
        definition.counter.type === AchievementCounterType.Sum ||
        definition.counter.type === AchievementCounterType.Current
      ) {
        // Берём число из указанного поля: например, amount при расходе ресурса.
        const amount = getAchievementField(data, definition.counter.field)
        if (
          typeof amount !== "number" ||
          !Number.isFinite(amount) ||
          (isCurrent ? amount < 0 : amount <= 0)
        ) {
          continue
        }
        increment = amount
      } else if (definition.counter.type === AchievementCounterType.Unique) {
        const item = getAchievementField(data, definition.counter.field)
        // Собираем названия или числовые ID. null, объекты и отсутствующие поля не считаем.
        if (
          typeof item !== "string" &&
          !(typeof item === "number" && Number.isFinite(item))
        )
          continue
        if (current?.seen?.includes(item)) continue
        // Копируем список: предварительный расчёт не должен менять прогресс бэка.
        seen = [...(current?.seen ?? []), item]
        increment = 0
      } else {
        // Если бэк прислал ещё не поддерживаемый способ подсчёта, пропускаем его.
        continue
      }

      // Показываем не больше цели: максимум 10/10, даже если событий было 12.
      const nextValue = Math.min(
        definition.target,
        seen ? seen.length : isCurrent ? increment : value + increment
      )
      progress.permanent ??= {}
      progress.permanent[definition.id] = {
        ...current,
        value: nextValue,
        ...(seen ? { seen } : {}),
        ...(streak !== undefined ? { streak } : {}),
        // Даты выполнения и выдачи награды устанавливает только бэк.
        completed_at: current?.completed_at ?? null,
        reward_granted_at: current?.reward_granted_at ?? null,
      }
      if (nextValue >= definition.target) reachedIds.add(definition.id)
    }
  }

  return { progress, reachedAchievementIds: [...reachedIds] }
}
