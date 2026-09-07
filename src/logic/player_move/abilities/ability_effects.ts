import { Card, EffectObject, GameObj, Leader } from "@/types"

export function incr_effects(card: Card | Leader, gameObj: GameObj) {
  // увеличивает длину всех позитивных эффектов
  const { effects } = gameObj
  const value = card.data?.value || 0
  for (let i = 0; i < effects.length; i++) {
    const effectObject: EffectObject | "" = effects[i]
    if (effectObject && !effectObject.negative) {
      if (effectObject?.turns) effectObject.turns += value
      if (effectObject?.times_count) effectObject.times_count += value
    }
  }
}

export function remove_effects(gameObj: GameObj) {
  // убирает все негативные эффекты
  const { effects } = gameObj
  for (let i = 0; i < effects.length; i++) {
    const effectObject: EffectObject | "" = effects[i]
    if (effectObject && effectObject.negative) effects[i] = ""
  }
}
