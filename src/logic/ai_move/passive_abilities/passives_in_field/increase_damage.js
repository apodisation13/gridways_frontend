import { sound_passive_increase_damage } from "@/logic/play_sounds"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { choice_element } from "@/lib/utils"

function incr_self_dmg(enemy, timeout = 1000) {
  timeoutAnimationFlag(
    enemy,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  enemy.dmg_delta += enemy.value
  setTimeout(() => {
    enemy.dmg_delta = null
  }, timeout * 0.5)
  enemy.damage += enemy.value
}

function incr_random_dmg(enemy, field, timeout = 1000) {
  let all_enemies = get_all_enemies(field, undefined)
  const random_enemy = choice_element(all_enemies)
  if (!random_enemy) return

  timeoutAnimationFlag(
    enemy,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  random_enemy.dmg_delta += enemy.value
  setTimeout(() => {
    random_enemy.dmg_delta = null
  }, timeout * 0.5)
  random_enemy.damage += enemy.value
}

function incr_dmg_row(enemy, field, timeout = 1000) {
  let index = field.indexOf(enemy)
  let min = Math.floor(index / 3) * 3
  let max = min + 3
  sound_passive_increase_damage()
  timeoutAnimationFlag(enemy, "incr_dmg", null, timeout * 0.5)
  field.slice(min, max).forEach(e => {
    if (e) {
      e.dmg_delta += enemy.value
      setTimeout(() => {
        e.dmg_delta = null
      }, timeout * 0.5)
      e.damage += enemy.value
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
      field[i].dmg_delta += enemy.value
      setTimeout(() => {
        field[i].dmg_delta = null
      }, timeout * 0.5)
      field[i].damage += enemy.value
    }
  })
}

export { incr_self_dmg, incr_random_dmg, incr_dmg_row, incr_dmg_column }
