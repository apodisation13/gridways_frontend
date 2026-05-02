import {
  allowActionTimer,
  timeoutAnimationFlag,
} from "@/logic/game_logic/timers"
import { if_in_grave_spawn_self_in_enemy_grave } from "@/logic/player_move/passive_abilities/passives_in_grave/if_in_grave_spawn_self_in_enemy_grave"
import { heal_leader } from "@/logic/player_move/passive_abilities/passives_in_hand/heal_leader"
import { incr_self_dmg } from "@/logic/player_move/passive_abilities/passives_in_hand/incr_dmg"
import type { Card, GameObj } from "@/types"

export function grave_passives(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(card)) return

  timeoutAnimationFlag(card, "trigger_grave_passive", null, timeout * 0.5)

  // ДИСПЕТЧЕР ПАССИВНЫХ АБИЛОК В КЛАДБИЩЕ
  const cpa = card?.passive_ability?.name
  if (cpa === "incr-self-dmg") {
    incr_self_dmg(card, true, timeout)
  } else if (cpa === "heal-leader") {
    heal_leader(card, timeout)
  } else if (cpa === "if-in-grave-spawn-self-in-enemy-grave") {
    if_in_grave_spawn_self_in_enemy_grave(card, gameObj, timeout)
  }
}
