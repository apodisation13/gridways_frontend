import router from "@/router/router"
import store from "@/store"

// проверка выигрыша - если осталось 0 врагов и на поле никого
function check_win(field, enemy_list, enemy_leader, enemies_grave) {
  if (enemy_list.length !== 0) return
  if (enemy_leader.data.hp > 0) return

  for (let i = 0; i < field.length; i++) {
    if (field[i]) return
  }

  store.commit("set_win_redirect", true)
  store.commit("set_enemies_grave", enemies_grave)
  router.push("win")
}

export { check_win }
