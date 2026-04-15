import { incr_dmg_to_all_hand } from "@/logic/player_move/abilities/ability_incr_dmg_to_all_hand"

export function deathwish_incr_dmg_to_all_hand(enemy, gameObj, timeout = 1000) {
  incr_dmg_to_all_hand(enemy, gameObj, timeout)
}
