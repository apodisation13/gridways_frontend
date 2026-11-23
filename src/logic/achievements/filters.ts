import type {
  AchievementEventValue,
  AchievementFilter,
  AchievementFilters,
} from "@/types"
import { AchievementFilterOperator } from "@/types"

// Пути считаются от event.data: actor.color, actor.data.damage, actor.tags.0.
// undefined означает отсутствие поля; null — существующее поле с пустым значением.
export function getAchievementField(
  data: Record<string, AchievementEventValue>,
  path: string
): AchievementEventValue | undefined {
  let current: AchievementEventValue = data
  for (const key of path.split(".")) {
    if (!key || ["__proto__", "prototype", "constructor"].includes(key))
      return undefined
    if (current === null || typeof current !== "object") return undefined
    if (Array.isArray(current)) {
      if (!/^(0|[1-9]\d*)$/.test(key)) return undefined
      const index = Number(key)
      if (index >= current.length) return undefined
      current = current[index]
    } else {
      if (!Object.prototype.hasOwnProperty.call(current, key)) return undefined
      current = current[key]
    }
  }
  return current
}

function matchesCondition(
  actual: AchievementEventValue | undefined,
  condition: AchievementFilter
): boolean {
  if (condition === null || typeof condition !== "object")
    return actual !== undefined && actual === condition
  const { type, value } = condition
  if (type === AchievementFilterOperator.Exists)
    return (actual !== undefined) === value
  // Даже ne не проходит для отсутствующего поля. Для отсутствия есть exists: false.
  if (actual === undefined) return false
  if (type === AchievementFilterOperator.Eq) return actual === value
  if (type === AchievementFilterOperator.Ne) return actual !== value
  if (type === AchievementFilterOperator.In)
    return value.some(item => actual === item)
  // Строку "8" и boolean не превращаем в число; неизвестные операторы не проходят.
  if (
    typeof actual !== "number" ||
    !Number.isFinite(actual) ||
    typeof value !== "number" ||
    !Number.isFinite(value)
  )
    return false
  switch (type) {
    case AchievementFilterOperator.Gt:
      return actual > value
    case AchievementFilterOperator.Gte:
      return actual >= value
    case AchievementFilterOperator.Lt:
      return actual < value
    case AchievementFilterOperator.Lte:
      return actual <= value
    default:
      return false
  }
}

export function matchesAchievementFilters(
  data: Record<string, AchievementEventValue>,
  filters: AchievementFilters
): boolean {
  // Соседние поля — И; any требует хотя бы один подходящий набор условий.
  // Пустой filters по-прежнему подходит любому событию этого типа.
  return Object.entries(filters).every(([path, condition]) => {
    if (path === "any") {
      if (!Array.isArray(condition) || !condition.length) return false
      return condition.some(group =>
        Object.entries(group).every(
          ([field, rule]) =>
            field !== "any" &&
            !Array.isArray(rule) &&
            matchesCondition(getAchievementField(data, field), rule)
        )
      )
    }
    if (Array.isArray(condition)) return false
    return matchesCondition(getAchievementField(data, path), condition)
  })
}
