import { Card, Leader } from "@/types"

export function add_damage_to_leader(
  card: Card | Leader | { data: { damage: number; value: number } },
  leader: Leader,
  timeout: 1000
): void {
  const dmg_delta = card.data?.value || 0
  leader.dmg_delta = dmg_delta
  setTimeout(() => {
    leader.dmg_delta = null
  }, timeout * 0.5)
  leader.data.damage += dmg_delta
}
