import { add_armor } from "@/logic/player_move/abilities/ability_armor"

export function add_armor_passive(card, timeout = 1000) {
  add_armor(card.data.passive.value, timeout)
}
