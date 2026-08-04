import type { Card } from "@/types"

export function set_self_as_deck_len(card: Card, deck: Card[]): void {
  const neutral_cards = deck.filter(card => card.faction === "Neutral")
  console.log(neutral_cards)
  if (neutral_cards.length !== 1) return
  const deck_len = deck.length
  card.data.damage = deck_len
  card.data.charges = deck_len
  card.data.heal = deck_len
}
