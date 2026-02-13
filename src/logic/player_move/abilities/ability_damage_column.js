import { sound_damage_column } from "@/logic/play_sounds"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"

function damage_column(enemy, card, gameObj, timeout = 1000) {
  const { field } = gameObj
  let index = field.indexOf(enemy) % 3
  let indexes = [index, index + 3, index + 6, index + 9]

  sound_damage_column()
  indexes.forEach(i => {
    if (field[i]) hit_one_enemy(field[i], card, gameObj, timeout)
  })
}

export { damage_column }
