import { sound_damage_all } from "@/logic/play_sounds"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"

function damage_all(field, card, gameObj, timeout = 1000) {
  field.forEach(enemy => {
    if (enemy) hit_one_enemy(enemy, card, gameObj, timeout)
  })
  sound_damage_all()
}

export { damage_all }
