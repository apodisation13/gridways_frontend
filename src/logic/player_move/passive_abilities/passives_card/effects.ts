import { choice_element, copyObj } from "@/lib/utils"
import { effectsSounds } from "@/logic/game_logic/effects"
import {
  get_effects_indexes,
  get_empty_field_indexes,
  get_negative_effects_indexes,
  get_positive_effects_indexes,
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
  const emptyEffectIndexes = get_effects_indexes(effects)
  const effectSet = new Set(emptyEffectIndexes)
  const available = emptyIndexes.filter(i => !effectSet.has(i))
  const randomIndex = choice_element(available)

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

export function incr_effect(card: Card | Leader, gameObj: GameObj) {
  const { effects } = gameObj
  const value = card.data.passive?.value

  if (!value) return

  const emptyEffectIndexes = get_positive_effects_indexes(effects)
  const randomIndex = choice_element(emptyEffectIndexes)

  if (!randomIndex) return

  const effectObject = effects[randomIndex] as EffectObject
  if (!effectObject) return

  if (effectObject.turns) effectObject.turns += value
  if (effectObject.times_count) effectObject.times_count += value
}

export function remove_effect(gameObj: GameObj) {
  // пассивка игрока - убиарет слуайный негативный эффект
  const { effects } = gameObj

  const emptyEffectPositiveIndexes = get_negative_effects_indexes(effects)
  const randomIndex = choice_element(emptyEffectPositiveIndexes)
  if (!randomIndex) return

  const effectObject = effects[randomIndex] as EffectObject
  if (!effectObject) return

  effects[randomIndex] = ""
}
