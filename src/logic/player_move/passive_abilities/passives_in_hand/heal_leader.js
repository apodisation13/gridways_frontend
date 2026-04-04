import { heal } from "@/logic/player_move/abilities/ability_heal"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"

function heal_leader(card, timeout = 1000) {
  heal({ heal: card.data.passive.value })
  timeoutAnimationFlag(card, "healing", null, timeout * 0.5)
}

export { heal_leader }
