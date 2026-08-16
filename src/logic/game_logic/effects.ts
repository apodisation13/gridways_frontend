import {
  frost_sound,
  lock_placed,
  mine_placed,
  poison_sound,
  purify_sound,
  rain_applied,
  spikes,
  veil_placed,
} from "@/logic/play_sounds"
import { EffectObject, EffectType } from "@/types"

export function effectsSounds(fi: EffectObject) {
  if (
    fi.type === EffectType.Mine ||
    fi.type === EffectType.LightMine ||
    fi.type === EffectType.MiddleMine
  ) {
    mine_placed()
  } else if (fi.type === EffectType.Rain) {
    rain_applied()
  } else if (fi.type === EffectType.Lock) {
    lock_placed()
  } else if (fi.type === EffectType.Veil) {
    veil_placed()
  } else if (fi.type === EffectType.Purify) {
    purify_sound()
  } else if (fi.type === EffectType.Spikes) {
    spikes()
  } else if (fi.type === EffectType.Poison) {
    poison_sound()
  } else if (fi.type === EffectType.Frost) {
    frost_sound()
  }
}
