import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_passive_increase_damage } from "@/logic/play_sounds"
import { CardColor, Enemy, EnemyLeader, GameObj, Leader } from "@/types"

function processSingleEnemy(
  enemy: Enemy | EnemyLeader,
  leader: Leader,
  timeout: number = 1000
): boolean {
  if (!(enemy as Enemy).color) return false // если убили лидера врагов - сразу выходим

  if (enemy.data.hp <= 0 && (enemy as Enemy).color == CardColor.Gold) {
    timeoutAnimationFlag(
      leader,
      "incr_dmg",
      sound_passive_increase_damage,
      timeout * 0.5
    )
    leader.p_dmg_delta = leader.data.passive?.value ?? 0
    setTimeout(() => {
      leader.p_dmg_delta = null
    }, timeout * 0.5)
    leader.data.damage += leader.data.passive?.value ?? 0
    return (leader.data.passive?.value ?? 0) !== 0
  }
  return false
}

export function add_dmg_to_leader_when_kill_gold(
  enemy: Enemy | EnemyLeader,
  leader: Leader,
  targets: Array<{ isLeader: boolean; fieldValue: Enemy | null }> = [],
  gameObj: GameObj,
  timeout: number = 1000
): boolean {
  let applied = false
  // для обычного режима, без multi-целей
  if (targets.length === 0) {
    return processSingleEnemy(enemy, leader, timeout)
  }
  // для режима multi-целей, тут проверяем каждую карту из тех, в которых стреляли
  for (const target of targets) {
    const e: Enemy | EnemyLeader | null = target.isLeader
      ? (gameObj.enemy_leader ?? null)
      : target.fieldValue
    if (!e) continue
    // Не используем short-circuit: эффект нужен каждой подходящей цели.
    if (processSingleEnemy(e, leader, timeout)) applied = true
  }
  return applied
}
