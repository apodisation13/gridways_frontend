import {
  lock_placed,
  mine_placed,
  purify_sound,
  rain_applied,
  spikes,
  veil_placed,
} from "@/logic/play_sounds"
import { EffectObject, EffectType } from "@/types"

export function effectsSounds(fi: EffectObject) {
  if (fi.type === EffectType.Mine) {
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
  }
}
