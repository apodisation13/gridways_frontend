import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import {
  frost_sound,
  mine_triggerred,
  rain_triggerred,
  sound_passive_increase_damage,
  spikes,
  veil_triggerred,
} from "@/logic/play_sounds"
import { lock_enemy } from "@/logic/player_move/abilities/ability_lock"
import { poison_one_enemy } from "@/logic/player_move/abilities/ability_poison"
import { purify } from "@/logic/player_move/abilities/ability_purify"
import { enemy_takes_damage } from "@/logic/player_move/abilities/enemy_takes_damage"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"
import { EffectObject, Enemy, EnemyStatus, GameObj } from "@/types"
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

  const e = enemy as Enemy

  if (effect.type === EffectType.Mine) {
    mine_triggerred()
    enemy_takes_damage(
      enemy,
      { data: { damage: enemy.data.hp } },
      gameObj,
      timeout
    )
    enemyKilled = true
    effectDecrement(index, effect, gameObj)
  } else if (effect.type === EffectType.Rain) {
    rain_triggerred()
    hit_one_enemy(e, { data: { damage: effect.value || 0 } }, gameObj, timeout)
    if (e.data.hp <= 0) enemyKilled = true
    effectDecrement(index, effect, gameObj)
  } else if (effect.type === EffectType.Spikes) {
    if (e.data.damage <= 0) return true // вот тут типа враг не будет наносить урон
    let effectValue = effect.value || 0 // 3
    let resultDamage = e.data.damage - effectValue // 2 - (+3) = -1
    if (resultDamage < 0) {
      resultDamage = 0 // 0
      effectValue = e.data.damage
    }
    timeoutAnimationFlag(
      enemy,
      "incr_dmg",
      sound_passive_increase_damage,
      timeout * 0.5
    )
    enemy.dmg_delta = effectValue
    setTimeout(() => {
      enemy.dmg_delta = null
    }, timeout * 0.5)
    enemy.data.damage = resultDamage
    spikes()
    effectDecrement(index, effect, gameObj)
  } else if (effect.type === EffectType.Veil) {
    veil_triggerred()
    effectDecrement(index, effect, gameObj)
    return true // враг по сути не может наносить урон
  } else if (effect.type === EffectType.Purify) {
    effectDecrement(index, effect, gameObj)
    purify(e)
  } else if (effect.type === EffectType.Lock) {
    lock_enemy(e)
    effectDecrement(index, effect, gameObj)
  } else if (effect.type === EffectType.LightMine) {
    if (enemy.data.shield || enemy.data.status) {
      mine_triggerred()
      enemy_takes_damage(
        enemy,
        { data: { damage: enemy.data.hp } },
        gameObj,
        timeout
      )
      enemyKilled = true
      effectDecrement(index, effect, gameObj)
    }
  } else if (effect.type === EffectType.Frost) {
    frost_sound()
    hit_one_enemy(e, { data: { damage: effect.value || 0 } }, gameObj, timeout)
    if (e.data.hp <= 0) enemyKilled = true
    effectDecrement(index, effect, gameObj)
  } else if (effect.type === EffectType.Poison) {
    poison_one_enemy(e, gameObj, timeout)
    if (e?.data?.status === EnemyStatus.Poison) {
      effectDecrement(index, effect, gameObj)
    }
  } else if (effect.type === EffectType.MiddleMine) {
    if (enemy.passive_ability?.name || enemy.deathwish?.name) {
      mine_triggerred()
      enemy_takes_damage(
        enemy,
        { data: { damage: enemy.data.hp } },
        gameObj,
        timeout
      )
      enemyKilled = true
      effectDecrement(index, effect, gameObj)
    }
  }

  return enemyKilled
}

function effectDecrement(
  index: number,
  effect: EffectObject,
  gameObj: GameObj
) {
  if (effect.times_count !== undefined) {
    effect.times_count -= 1
    if (effect.times_count <= 0) gameObj.effects[index] = ""
  }
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
  applyEffectAtCell(index, gameObj, timeout * 0.75)
}
