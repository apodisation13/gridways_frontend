import type { AchievementEventValue } from "@/types"

// Объекты записываем строкой: порядок ключей не создаёт новый рецепт.
// Массивы внутри объекта сохраняют порядок; null/bool допустимы внутри JSON.
function sortedJson(value: AchievementEventValue): string {
  if (Array.isArray(value)) return `[${value.map(sortedJson).join(",")}]`
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${sortedJson(value[key])}`)
      .join(",")}}`
  }
  return JSON.stringify(value)
}

export function getUniqueValue(
  value: AchievementEventValue | undefined
): string | number | undefined {
  if (typeof value === "string") {
    // Строка, похожая на служебную запись объекта, всё равно остаётся строкой.
    if (value.startsWith("object:") || value.startsWith("string:"))
      return `string:${value}`
    return value
  }
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (value !== null && typeof value === "object" && !Array.isArray(value))
    return `object:${sortedJson(value)}`
  return undefined
}

export function hasUniqueValue(
  seen: readonly (string | number)[],
  value: AchievementEventValue | undefined,
  key: string | number
): boolean {
  if (value === null || typeof value !== "object") return seen.includes(key)
  return seen.some(saved => {
    if (typeof saved !== "string" || !saved.startsWith("object:")) return false
    // Python и JS могут записать одно число как 1.0 и 1. Сравниваем содержимое,
    // заново сериализовав сохранённый объект, а не оформление чисел в строке.
    try {
      return getUniqueValue(JSON.parse(saved.slice(7))) === key
    } catch {
      return false
    }
  })
}
