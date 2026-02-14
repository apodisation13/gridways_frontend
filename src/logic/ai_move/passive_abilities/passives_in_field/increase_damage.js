import { sound_passive_increase_damage } from "@/logic/play_sounds"
import {
  timeoutAnimationFlag,
  timeoutAnimationValue,
} from "@/logic/game_logic/timers"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { choice_element } from "@/lib/utils"

function incr_self_dmg(enemy, timeout = 1000) {
  timeoutAnimationFlag(enemy, "incr_dmg", null, timeout * 0.5)
  timeoutAnimationValue(
    enemy,
    "damage",
    `${enemy.damage}+${enemy.value}`,
    enemy.value,
    sound_passive_increase_damage,
    timeout * 0.5
  )
}

function incr_random_dmg(enemy, field, timeout = 1000) {
  let all_enemies = get_all_enemies(field, undefined)
  const random_enemy = choice_element(all_enemies)
  if (!random_enemy) return
  timeoutAnimationValue(
    random_enemy,
    "damage",
    `${random_enemy.damage}+${enemy.value}`,
    enemy.value,
    sound_passive_increase_damage,
    timeout * 0.5
  )
  timeoutAnimationFlag(enemy, "incr_dmg", null, timeout * 0.5)
}

function incr_dmg_row(enemy, field, timeout = 1000) {
  let index = field.indexOf(enemy)
  let min = Math.floor(index / 3) * 3
  let max = min + 3
  sound_passive_increase_damage()
  timeoutAnimationFlag(enemy, "incr_dmg", null, timeout * 0.5)
  field.slice(min, max).forEach(e => {
    if (e) {
      timeoutAnimationValue(
        e,
        "damage",
        `${e.damage}+${enemy.value}`,
        enemy.value,
        null,
        timeout * 0.5
      )
    }
  })
}

function incr_dmg_column(enemy, field, timeout = 1000) {
  let index = field.indexOf(enemy) % 3
  let indexes = [index, index + 3, index + 6, index + 9]
  sound_passive_increase_damage()
  timeoutAnimationFlag(enemy, "incr_dmg", null, timeout * 0.5)
  indexes.forEach(i => {
    if (field[i]) {
      timeoutAnimationValue(
        field[i],
        "damage",
        `${field[i].damage}+${enemy.value}`,
        enemy.value,
        null,
        timeout * 0.5
      )
    }
  })
}

export { incr_self_dmg, incr_random_dmg, incr_dmg_row, incr_dmg_column }
