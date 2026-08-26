import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"
import type { Enemy, EnemyLeader, GameObj, Leader } from "@/types"

export function add_charges_if_overkill(
  enemy: Enemy | EnemyLeader,
  leader: Leader,
  targets: Array<{ isLeader: boolean; fieldValue: Enemy | null }> = [],
  gameObj: GameObj
): void {
  // для обычного режима, без multi-целей
  if (targets.length === 0) {
    if (enemy.data.hp < 0) {
      change_card_charges(leader, 1)
    }
    return
  }
  // для режима multi-целей - проверяем каждую цель
  for (const target of targets) {
    const e: Enemy | EnemyLeader | null = target.isLeader
      ? (gameObj.enemy_leader ?? null)
      : target.fieldValue
    if (!e) continue
    if (e.data.hp < 0) {
      change_card_charges(leader, 1)
    }
  }
}
