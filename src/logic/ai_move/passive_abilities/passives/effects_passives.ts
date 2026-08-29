import { choice_element, copyObj } from "@/lib/utils"
import { effectsSounds } from "@/logic/game_logic/effects"
import {
  get_effects_indexes,
  get_empty_field_indexes,
  get_positive_effects_indexes,
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
  gameObj: GameObj
) {
  // генерим рандомный негативный эффект в случайной пустой клетке
  // берем из конфига (из game_const) информацию о всех эффектов, оттуда рандомный
  // а потом собираем его из того лежит в самой карте (effectObject)
  const { effects, field } = gameObj
  let effectObject = enemy.data?.passive?.field_interaction

  if (!effectObject) return

  const emptyIndexes = get_empty_field_indexes(field)
  const emptyEffectIndexes = get_effects_indexes(effects)
  const effectSet = new Set(emptyEffectIndexes)
  const available = emptyIndexes.filter(i => !effectSet.has(i))
  const randomIndex = choice_element(available)

  if (!randomIndex) return

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

  effects[randomIndex] = copyObj(realEffect)
  effectsSounds(realEffect)
}

export function spawn_effect(enemy: Enemy | EnemyLeader, gameObj: GameObj) {
  const { effects, field } = gameObj
  const effectObject = enemy.data?.passive?.field_interaction

  if (!effectObject) return

  const emptyIndexes = get_empty_field_indexes(field)
  const emptyEffectIndexes = get_effects_indexes(effects)
  const effectSet = new Set(emptyEffectIndexes)
  const available = emptyIndexes.filter(i => !effectSet.has(i))
  const randomIndex = choice_element(available)

  if (!randomIndex) return

  effects[randomIndex] = copyObj(effectObject)
  effectsSounds(effectObject)
}

export function decr_effect(enemy: Enemy | EnemyLeader, gameObj: GameObj) {
  const { effects } = gameObj

  const value = enemy.data.passive?.value
  if (!value) return

  const emptyEffectPositiveIndexes = get_positive_effects_indexes(effects)
  const randomIndex = choice_element(emptyEffectPositiveIndexes)
  if (!randomIndex) return

  const effectObject = effects[randomIndex] as EffectObject
  if (!effectObject) return

  if (effectObject.turns) {
    effectObject.turns -= value
    if (effectObject.turns <= 0) effects[randomIndex] = ""
  }
  if (effectObject.times_count) {
    effectObject.times_count -= value
    if (effectObject.times_count <= 0) effects[randomIndex] = ""
  }
}

export function remove_effect(gameObj: GameObj) {
  // пассивка врага - убиарет слуайный позитивный эффект
  const { effects } = gameObj

  const emptyEffectPositiveIndexes = get_positive_effects_indexes(effects)
  const randomIndex = choice_element(emptyEffectPositiveIndexes)
  if (!randomIndex) return

  const effectObject = effects[randomIndex] as EffectObject
  if (!effectObject) return

  effects[randomIndex] = ""
}
