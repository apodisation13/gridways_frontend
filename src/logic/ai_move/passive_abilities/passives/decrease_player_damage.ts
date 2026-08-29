import { choice_element } from "@/lib/utils"
import { sound_enemy_decrease_player_damage } from "@/logic/play_sounds"
import type { Card } from "@/types"

export function decrease_player_damage(
  dmg_delta: number,
  hand: Card[],
  timeout = 1000
): void {
  let random_hand_card = choice_element(hand)
  if (!dmg_delta) return
  random_hand_card.dmg_delta = -dmg_delta
  sound_enemy_decrease_player_damage()
  setTimeout(() => {
    random_hand_card.dmg_delta = null
  }, timeout * 0.5)
  random_hand_card.data.damage -= dmg_delta
  if (random_hand_card.data.damage < 0) random_hand_card.data.damage = 0
}
