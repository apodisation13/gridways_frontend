import { mine_triggerred, rain_triggerred } from "@/logic/play_sounds"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"
import type { EffectObject, Enemy, GameObj } from "@/types"
import { EffectType } from "@/types"

// Apply the cell effect at index after an enemy has landed there.
// Returns true if the enemy was killed by the effect.
export function applyEffectAtCell(
  index: number,
  gameObj: GameObj,
  timeout: number = 1000
): boolean {
  const enemy = gameObj.field[index]
  const cellObj = gameObj.effects[index]
  if (!enemy || !cellObj) return false

  const effect = cellObj as EffectObject
  let enemyKilled = false

  if (effect.type === EffectType.Mine) {
    mine_triggerred()
    enemy_takes_damage(
      enemy,
      { data: { damage: enemy.data.hp } },
      gameObj,
      timeout
    )
    enemyKilled = true
  } else if (effect.type === EffectType.Rain) {
    rain_triggerred()
    const e = enemy as Enemy
    hit_one_enemy(e, { data: { damage: effect.value || 0 } }, gameObj, timeout)
    if (e.data.hp <= 0) enemyKilled = true
  }

  if (effect.times_count !== undefined) {
    effect.times_count -= 1
    if (effect.times_count <= 0) gameObj.effects[index] = ""
  }

  return enemyKilled
}

// Decrement turns for all active effects — called once after all enemies have moved.
export function decrementEffectTurns(gameObj: GameObj): void {
  for (let i = 0; i < gameObj.effects.length; i++) {
    const cellObj = gameObj.effects[i]
    if (!cellObj) continue
    const effect = cellObj as EffectObject
    if (effect.turns !== undefined) {
      effect.turns -= 1
      if (effect.turns <= 0) gameObj.effects[i] = ""
    }
  }
}

// Place an enemy at an empty cell index and immediately apply any effect there.
export function enemySpawnsAtEmptyCell(
  enemy: Enemy,
  index: number,
  gameObj: GameObj,
  timeout = 1000
): void {
  gameObj.field[index] = enemy
  applyEffectAtCell(index, gameObj, timeout)
}
