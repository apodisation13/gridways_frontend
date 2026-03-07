import { sound_heal } from "@/logic/play_sounds"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { choice_element } from "@/lib/utils"

// ВРАГ лечит пассивно в конце хода сам себя на VALUE
function heal_self(enemy, timeout = 1000) {
  // поставили на 0.5 врагу это поле, чтобы проиграть анимацию урона
  enemy.hp_delta = enemy.value
  setTimeout(() => {
    enemy.hp_delta = null
  }, timeout)
  enemy.hp += enemy.value
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

// враг лечит пассивно в конце хода лидера врагов на VALUE
function heal_enemy_leader(enemy, enemy_leader, timeout = 1000) {
  enemy_leader.hp_delta = enemy.value
  setTimeout(() => {
    enemy_leader.hp_delta = null
  }, timeout)
  enemy_leader.hp += enemy.value
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

// враг лечит пассивно в конце хода всех врагов на VALUE
function heal_all(enemy, field, enemy_leader, timeout = 1000) {
  let all_enemies = get_all_enemies(field, enemy_leader)

  sound_heal()
  all_enemies.forEach(e => {
    e.hp_delta = e.value
    setTimeout(() => {
      e.hp_delta = null
    }, timeout)
    e.hp += e.value
  })
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

function heal_random(enemy, field, enemy_leader, timeout = 1000) {
  let all_enemies = get_all_enemies(field, enemy_leader)
  const random_enemy = choice_element(all_enemies)

  random_enemy.hp_delta = enemy.value
  setTimeout(() => {
    random_enemy.hp_delta = null
  }, timeout)
  random_enemy.hp += random_enemy.value
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

function heal_self_by_highest_hp(enemy, field, enemy_leader, timeout = 1000) {
  let all_enemies = get_all_enemies(field, enemy_leader)
  all_enemies.splice(all_enemies.indexOf(enemy), 1) // EXCLUDE self)
  if (!all_enemies.length) return

  all_enemies.sort((a, b) => b.hp - a.hp)
  const target = all_enemies[0]

  enemy.hp_delta = target.value
  setTimeout(() => {
    enemy.hp_delta = null
  }, timeout)
  enemy.hp += target.value
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
}

function heal_row(enemy, field, timeout = 1000) {
  let index = field.indexOf(enemy)
  let min = Math.floor(index / 3) * 3
  let max = min + 3
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
  field.slice(min, max).forEach(e => {
    if (e) {
      e.hp_delta = enemy.value
      setTimeout(() => {
        e.hp_delta = null
      }, timeout)
      e.hp += enemy.value
    }
  })
}

function heal_column(enemy, field, timeout = 1000) {
  let index = field.indexOf(enemy) % 3
  let indexes = [index, index + 3, index + 6, index + 9]
  timeoutAnimationFlag(enemy, "healing", sound_heal, timeout * 0.5)
  indexes.forEach(i => {
    if (field[i]) {
      field[i].hp_delta = enemy.value
      setTimeout(() => {
        field[i].hp_delta = null
      }, timeout)
      field[i].hp += enemy.value
    }
  })
}

export {
  heal_self,
  heal_enemy_leader,
  heal_all,
  heal_random,
  heal_self_by_highest_hp,
  heal_row,
  heal_column,
}
