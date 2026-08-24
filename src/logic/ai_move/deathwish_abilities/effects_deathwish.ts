import { copyObj } from "@/lib/utils"
import { effectsSounds } from "@/logic/game_logic/effects"
import {
  get_effects_indexes,
  get_empty_field_indexes,
} from "@/logic/player_move/service/service_for_player_move"
import store from "@/store"
import {
  EffectInfo,
  EffectObject,
  EffectType,
  Enemy,
  EnemyLeader,
  GameObj,
} from "@/types"

export function spawn_effect_random(
  enemy: Enemy | EnemyLeader,
  enemyIndex: number | null,
  gameObj: GameObj
) {
  if (!enemyIndex) return

  // генерим рандомный негативный эффект в той клетке где умер враг
  // берем из конфига (из game_const) информацию о всех эффектов, оттуда рандомный
  // а потом собираем его из того лежит в самой карте (effectObject)
  const { effects } = gameObj
  let effectObject = enemy.data?.deathwish?.field_interaction

  if (!effectObject) return

  const effectsInfo = store.getters["effectsInfo"] as Record<string, EffectInfo>
  const negativeEffects = Object.entries(effectsInfo).filter(
    ([_, v]) => v.negative
  )
  const [randomKey, randomValue] = negativeEffects[
    Math.floor(Math.random() * negativeEffects.length)
  ] as [EffectType, EffectInfo]

  const realEffect: EffectObject = {
    type: randomKey,
    value: effectObject.value,
    turns: randomValue.turn_type === "turns" ? effectObject.turns : undefined,
    times_count:
      randomValue.turn_type === "times_count"
        ? effectObject.times_count
        : undefined,
    negative: true,
  }

  effects[enemyIndex] = copyObj(realEffect)
  effectsSounds(realEffect)
}

export function spawn_effect(
  enemy: Enemy | EnemyLeader,
  enemyIndex: number | null,
  gameObj: GameObj
) {
  if (!enemyIndex) return

  const { effects } = gameObj
  let effectObject = enemy.data?.deathwish?.field_interaction

  if (!effectObject) return

  effects[enemyIndex] = copyObj(effectObject)
  effectsSounds(effectObject)
}

export function spawn_effect_everywhere(
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
) {
  const { effects, field } = gameObj
  let effectObject = enemy.data?.deathwish?.field_interaction

  if (!effectObject) return

  const emptyIndexes = get_empty_field_indexes(field)
  const emptyEffectIndexes = get_effects_indexes(effects)
  const effectSet = new Set(emptyEffectIndexes)
  const available = emptyIndexes.filter(i => !effectSet.has(i))

  console.log(85, available)

  for (const index of available) {
    effects[index] = copyObj(effectObject)
  }
  effectsSounds(effectObject)
}
