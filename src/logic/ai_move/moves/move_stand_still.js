import { damage_player } from "@/logic/ai_move/moves/damage"

function stand_still(field, i, timeout = 1000) {
  damage_player(field, i, timeout)
}

export { stand_still }
