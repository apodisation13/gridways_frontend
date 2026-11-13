import type { AchievementEventValue } from "@/types"
import { CardColor } from "@/types/game"

// Сводка относится только к картам. Лидер не участвует ни в размере, ни в цветах.
export function buildDeckSummary(cards: AchievementEventValue | undefined) {
  const entries = Array.isArray(cards) ? cards : []
  const byColor = {
    [CardColor.Bronze]: 0,
    [CardColor.Silver]: 0,
    [CardColor.Gold]: 0,
  }
  let neutralCount = 0
  let knownFactions = 0
  for (const card of entries) {
    if (!card || typeof card !== "object" || Array.isArray(card)) continue
    const color = card.color
    if (
      color === CardColor.Bronze ||
      color === CardColor.Silver ||
      color === CardColor.Gold
    )
      byColor[color]++
    if (typeof card.faction === "string" && card.faction.length) knownFactions++
    if (card.faction === "Neutral") neutralCount++
  }
  const count = entries.length
  return {
    cards_count: count,
    by_color: byColor,
    neutral_count: neutralCount,
    // Пустой или неполный состав не проходит условия «все карты».
    all_bronze: count > 0 && byColor[CardColor.Bronze] === count,
    all_silver: count > 0 && byColor[CardColor.Silver] === count,
    all_gold: count > 0 && byColor[CardColor.Gold] === count,
    all_neutral: count > 0 && neutralCount === count,
    no_neutral: count > 0 && knownFactions === count && neutralCount === 0,
  }
}
