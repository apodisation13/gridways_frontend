import { sound_enemy_decrease_player_damage } from "@/logic/play_sounds"
import { choice_element } from "@/lib/utils"
import type { Card, Enemy } from "@/types"

export function decrease_player_damage(
  enemy: Enemy,
  hand: Card[],
  timeout = 1000
): void {
  let random_hand_card = choice_element(hand)
  random_hand_card.dmg_delta = -enemy.data.passive.value
  sound_enemy_decrease_player_damage()
  setTimeout(() => {
    random_hand_card.dmg_delta = null
  }, timeout * 0.5)
  random_hand_card.data.damage -= enemy.data.passive.value
}
