import { choice_element, copyObj } from "@/lib/utils"
import { effectsSounds } from "@/logic/game_logic/effects"
import {
  get_effects_indexes,
  get_empty_field_indexes,
} from "@/logic/player_move/service/service_for_player_move"
import store from "@/store"
import {
  Card,
  EffectInfo,
  EffectObject,
  EffectType,
  GameObj,
  Leader,
} from "@/types"

export function spawn_effect(card: Card | Leader, gameObj: GameObj) {
  const { effects, field } = gameObj
  const effectObject = card.data?.passive?.field_interaction

  if (!effectObject) return

  const emptyIndexes = get_empty_field_indexes(field)
  const randomIndex = choice_element(emptyIndexes)

  if (!randomIndex) return

  effects[randomIndex] = copyObj(effectObject)
  effectsSounds(effectObject)
}

export function spawn_effect_random(card: Card | Leader, gameObj: GameObj) {
  // генерим рандомный НЕ негативный эффект в случайной пустой клетке
  // берем из конфига (из game_const) информацию о всех эффектов, оттуда рандомный
  // а потом собираем его из того лежит в самой карте (effectObject)
  const { effects, field } = gameObj
  let effectObject = card.data?.passive?.field_interaction

  if (!effectObject) return

  const emptyIndexes = get_empty_field_indexes(field)
  const emptyEffectIndexes = get_effects_indexes(effects)
  const effectSet = new Set(emptyEffectIndexes)
  const available = emptyIndexes.filter(i => !effectSet.has(i))
  const randomIndex = choice_element(available)

  if (!randomIndex) return

  const effectsInfo = store.getters["effectsInfo"] as Record<string, EffectInfo>
  const positiveEffects = Object.entries(effectsInfo).filter(
    ([_, v]) => !v.negative
  )
  const [randomKey, randomValue] = positiveEffects[
    Math.floor(Math.random() * positiveEffects.length)
  ] as [EffectType, EffectInfo]

  const realEffect: EffectObject = {
    type: randomKey,
    value: effectObject.value,
    turns: randomValue.turn_type === "turns" ? effectObject.turns : undefined,
    times_count:
      randomValue.turn_type === "times_count"
        ? effectObject.times_count
        : undefined,
  }

  effects[randomIndex] = copyObj(realEffect)
  effectsSounds(realEffect)
}
