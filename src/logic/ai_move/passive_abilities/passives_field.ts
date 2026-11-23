import { run_passive } from "@/logic/ai_move/passive_abilities/passives_dispatcher"
import { allowActionTimer } from "@/logic/game_logic/timers"
import store from "@/store"
import type { Enemy, GameObj } from "@/types"

export function field_passives(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(enemy)) return
  if (run_passive(enemy, gameObj, timeout))
    store.commit("incrementAchievementBattleStat", {
      key: "enemy_passives_in_field",
      amount: 1,
    })
}
