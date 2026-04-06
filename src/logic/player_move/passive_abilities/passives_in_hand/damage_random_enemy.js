import { get_random_enemy } from "@/logic/player_move/service/service_for_player_move"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"
import { sound_damage_one } from "@/logic/play_sounds"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"

function damage_random_enemy(card, gameObj, timeout = 1000) {
  const { field, enemy_leader } = gameObj
  let target = get_random_enemy(field, enemy_leader) // взяли всех врагов, из них взяли одного

  if (!target) return // если щас нет врагов на поле и нет живого лидера врагов, выходим

  hit_one_enemy(
    target,
    { data: { damage: card.data.passive.value } },
    gameObj,
    timeout * 0.5
  )
  timeoutAnimationFlag(card, "p_damages_enemy", sound_damage_one, timeout * 0.5)
}

export { damage_random_enemy }
