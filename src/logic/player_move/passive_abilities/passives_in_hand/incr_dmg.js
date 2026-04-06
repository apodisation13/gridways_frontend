import { sound_passive_increase_damage } from "@/logic/play_sounds"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { choice } from "@/lib/utils"

export function incr_self_dmg(card, deck_or_grave = false, timeout = 1000) {
  timeoutAnimationFlag(
    card,
    "incr_dmg",
    deck_or_grave ? null : sound_passive_increase_damage,
    timeout * 0.5
  )
  card.p_dmg_delta = card.data.passive.value
  setTimeout(() => {
    card.p_dmg_delta = null
  }, timeout * 0.5)
  card.data.damage += card.data.passive.value
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

  timeoutAnimationFlag(
    target,
    "incr_dmg",
    deck_or_grave ? null : sound_passive_increase_damage,
    timeout * 0.5
  )
  target.p_dmg_delta = card.data.passive.value
  setTimeout(() => {
    target.p_dmg_delta = null
  }, timeout * 0.5)
  target.data.damage += card.data.passive.value
}

export function inc_dmg_by_len_grave(card, gameObj, timeout = 1000) {
  const { grave } = gameObj

  timeoutAnimationFlag(
    card,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  card.p_dmg_delta = grave.length
  setTimeout(() => {
    card.p_dmg_delta = null
  }, timeout * 0.5)
  card.data.damage += grave.length
}

export function incr_dmg_by_len_deck(card, gameObj, timeout = 1000) {
  const { deck } = gameObj

  timeoutAnimationFlag(
    card,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  card.p_dmg_delta = deck.length
  setTimeout(() => {
    card.p_dmg_delta = null
  }, timeout * 0.5)
  card.data.damage += deck.length
}

export function incr_dmg_by_n_enemies_grave(card, gameObj, timeout = 1000) {
  const { enemies_grave } = gameObj
  if (!enemies_grave.length) return

  timeoutAnimationFlag(
    card,
    "incr_dmg",
    sound_passive_increase_damage,
    timeout * 0.5
  )
  card.p_dmg_delta = enemies_grave.length
  setTimeout(() => {
    card.p_dmg_delta = null
  }, timeout * 0.5)
  card.data.damage += enemies_grave.length
}
