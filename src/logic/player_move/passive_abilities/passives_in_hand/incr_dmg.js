import { sound_passive_increase_damage } from "@/logic/play_sounds"
import {
  timeoutAnimationFlag,
  timeoutAnimationValue,
} from "@/logic/game_logic/timers"
import { choice } from "@/lib/utils"

export function incr_self_dmg(card, deck_or_grave = false, timeout = 1000) {
  timeoutAnimationValue(
    card,
    "damage",
    `${card.damage}+${card.value}`,
    card.value,
    deck_or_grave ? null : sound_passive_increase_damage,
    timeout * 0.5
  )
  timeoutAnimationFlag(card, "incr_dmg", null, timeout * 0.5)
}

export function incr_dmg_to_random(
  card,
  gameObj,
  to,
  deck_or_grave = false,
  timeout = 1000
) {
  const { hand, deck, grave } = gameObj
  let target
  if (to === "hand") {
    if (!hand.length) return
    let random = choice(hand)
    target = hand[random]
  } else if (to === "deck") {
    if (!deck.length) return
    let random = choice(deck)
    target = deck[random]
  } else if (to === "grave") {
    if (!grave.length) return
    let random = choice(grave)
    target = grave[random]
  }

  timeoutAnimationValue(
    target,
    "damage",
    `${target.damage}+${card.value}`,
    card.value,
    deck_or_grave ? null : sound_passive_increase_damage,
    timeout * 0.5
  )
  timeoutAnimationFlag(target, "incr_dmg", null, timeout * 0.5)
}

export function inc_dmg_by_len_grave(card, gameObj, timeout = 1000) {
  const { grave } = gameObj

  timeoutAnimationValue(
    card,
    "damage",
    `${card.damage}+${grave.length}`,
    grave.length,
    sound_passive_increase_damage,
    timeout * 0.5
  )
  timeoutAnimationFlag(card, "incr_dmg", null, timeout * 0.5)
}

export function incr_dmg_by_len_deck(card, gameObj, timeout = 1000) {
  const { deck } = gameObj

  timeoutAnimationValue(
    card,
    "damage",
    `${card.damage}+${deck.length}`,
    deck.length,
    sound_passive_increase_damage,
    timeout * 0.5
  )
  timeoutAnimationFlag(card, "incr_dmg", null, timeout * 0.5)
}

export function incr_dmg_by_n_enemies_grave(card, gameObj, timeout = 1000) {
  const { enemies_grave } = gameObj
  if (!enemies_grave.length) return

  timeoutAnimationValue(
    card,
    "damage",
    `${card.damage}+${enemies_grave.length}`,
    enemies_grave.length,
    sound_passive_increase_damage,
    timeout * 0.5
  )
  timeoutAnimationFlag(card, "incr_dmg", null, timeout * 0.5)
}
