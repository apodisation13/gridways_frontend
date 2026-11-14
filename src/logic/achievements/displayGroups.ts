import type { AchievementDisplayEntry, AchievementDisplayRow } from "@/types"

// Вызывается отдельно для категории после фильтров. Выполненные всегда одиночные.
export function groupAchievementEntries(
  entries: AchievementDisplayEntry[]
): AchievementDisplayRow[] {
  const rows = new Map<string, AchievementDisplayRow>()
  for (const entry of entries) {
    const group = entry.definition.group
    const key = JSON.stringify(
      !entry.completed && group ? ["group", group] : ["task", entry.key]
    )
    const row = rows.get(key)
    if (row) {
      row.entries.push(entry)
      row.ordering = Math.min(row.ordering, entry.definition.ordering)
    } else {
      rows.set(key, {
        key,
        entries: [entry],
        ordering: entry.definition.ordering,
      })
    }
  }
  for (const row of rows.values()) {
    row.entries.sort(
      (a, b) =>
        a.definition.target - b.definition.target ||
        a.definition.ordering - b.definition.ordering ||
        a.key.localeCompare(b.key)
    )
  }
  return [...rows.values()].sort((a, b) => {
    const first = a.entries[0]
    const second = b.entries[0]
    if (first.completed !== second.completed) return first.completed ? 1 : -1
    if (first.completed && first.completedAt !== second.completedAt)
      return second.completedAt - first.completedAt
    return a.ordering - b.ordering || first.key.localeCompare(second.key)
  })
}
