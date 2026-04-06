import store from "@/store"
import { down_move } from "@/logic/ai_move/moves/move_down"
import { random_move } from "@/logic/ai_move/moves/move_random"
import { stand_still } from "@/logic/ai_move/moves/move_stand_still"
import { check_lose } from "@/logic/ai_move/service/check_lose"
import { set_already_jumped } from "@/logic/ai_move/service/service_for_ai_move"
import { get_all_enemies } from "@/logic/player_move/service/service_for_player_move"
import { right_move } from "@/logic/ai_move/moves/move_right"

function ai_move(field, timeout = 1000) {
  store.commit("set_ai_move", true)
  set_already_jumped(field) // установить false параметр enemy.already_jumped

  let enemies = get_all_enemies(field, null)
  enemies.reverse() // чтобы враги начинали снизу!!!!! ))))))

  let i = 0
  let id = setInterval(() => {
    if (i === enemies.length) {
      clearInterval(id)
      store.commit("set_ai_move", false)
    } else {
      // ДИСПЕТЧЕР способностей хода врагов
      if (enemies[i].move.name === "stand") {
        stand_still(field, field.indexOf(enemies[i]), timeout)
      } else if (
        enemies[i].move.name === "random" &&
        !enemies[i].already_jumped
      ) {
        random_move(field, field.indexOf(enemies[i]), timeout)
      } else if (enemies[i].move.name === "down") {
        down_move(field, field.indexOf(enemies[i]), timeout)
      } else if (enemies[i].move.name === "right") {
        right_move(field, field.indexOf(enemies[i]), timeout)
      }

      i += 1
    }
  }, timeout)
}

// эта функция срабатывает для лидера врагов только в начале игры 1 раз
function enemy_leader_ai_move_once(gameObj) {
  const { enemy_leader, deck } = gameObj
  const ela = enemy_leader.ability?.name

  if (!ela) return // есть лидеры у кого абилки нет

  if (ela === "damage-once") {
    store.commit("change_health", -enemy_leader.data.value)
    check_lose()
  } else if (ela === "decrease-all-player-damage") {
    deck.forEach(card => {
      card.data.damage -= enemy_leader.data.value
      if (card.data.damage < 0) card.data.damage = 0
    })
  }
}

export { ai_move, enemy_leader_ai_move_once }
