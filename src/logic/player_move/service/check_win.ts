import router from "@/router/router"
import store from "@/store"
import type { Enemy, EnemyLeader } from "@/types"

// проверка выигрыша - если осталось 0 врагов и на поле никого
export function check_win(
  field: (Enemy | "")[],
  enemy_list: Enemy[],
  enemy_leader: EnemyLeader,
  enemies_grave: Enemy[]
): void {
  if (enemy_list.length !== 0) return
  if (enemy_leader.data.hp > 0) return

  for (let i = 0; i < field.length; i++) {
    if (field[i]) return
  }

  store.commit("set_win_redirect", true)
  store.commit("set_enemies_grave", enemies_grave)
  router.push("win")
}
