import { Card, Leader } from "@/types"

export function add_charges_to_leader(
  card: Card | Leader | { data: { damage: number; value: number } },
  leader: Leader,
  timeout: 1000
): void {
  const charges_delta = card.data?.value || 0
  leader.charges_delta = charges_delta
  setTimeout(() => {
    leader.charges_delta = null
  }, timeout * 0.5)
  leader.data.charges += charges_delta
}
