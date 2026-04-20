import { incr_dmg_to_all_hand } from "@/logic/player_move/abilities/ability_incr_dmg_to_all_hand"
import type { GameObj } from "@/types"

export function deathwish_incr_dmg_to_all_hand(
  enemy: any,
  gameObj: GameObj,
  timeout = 1000
): void {
  incr_dmg_to_all_hand(enemy, gameObj, timeout)
}
