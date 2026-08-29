import {
  allowActionTimer,
  timeoutAnimationFlag,
} from "@/logic/game_logic/timers"
import { add_armor } from "@/logic/player_move/abilities/ability_armor"
import { add_armor_passive } from "@/logic/player_move/passive_abilities/passives_card/armor"
import { damage_random_enemy } from "@/logic/player_move/passive_abilities/passives_card/damage_random_enemy"
import { destroy_2_enemies } from "@/logic/player_move/passive_abilities/passives_card/destroy_2_enemies"
import { destroy_with_passive } from "@/logic/player_move/passive_abilities/passives_card/destroy_with_passive"
import { passive_destroy_with_status } from "@/logic/player_move/passive_abilities/passives_card/destroy_with_status"
import {
  incr_effect,
  remove_effect,
  spawn_effect,
  spawn_effect_random,
} from "@/logic/player_move/passive_abilities/passives_card/effects"
import {
  destroy_random_enemy_with_armor,
  remove_random_enemy_armor,
} from "@/logic/player_move/passive_abilities/passives_card/enemy_armor"
import { heal_leader } from "@/logic/player_move/passive_abilities/passives_card/heal_leader"
import { if_in_grave_spawn_self_in_enemy_grave } from "@/logic/player_move/passive_abilities/passives_card/if_in_grave_spawn_self_in_enemy_grave"
import {
  inc_dmg_by_len_grave,
  incr_dmg_by_len_deck,
  incr_dmg_by_n_enemies_grave,
  incr_dmg_to_random,
  incr_self_dmg,
} from "@/logic/player_move/passive_abilities/passives_card/incr_dmg"
import { lock_random } from "@/logic/player_move/passive_abilities/passives_card/lock_random"
import {
  poison_all_enemies_passive,
  poison_random_enemy_passive,
} from "@/logic/player_move/passive_abilities/passives_card/poison"
import { remove_deathwish } from "@/logic/player_move/passive_abilities/passives_card/remove_deathwish"
import { remove_passive } from "@/logic/player_move/passive_abilities/passives_card/remove_passive"
import { remove_shield } from "@/logic/player_move/passive_abilities/passives_card/remove_shield"
import { set_dmg_as_random_enemy_grave } from "@/logic/player_move/passive_abilities/passives_card/set_dmg_as_random_enemy_grave"
import {
  spawn_random_enemy_in_deck,
  spawn_random_enemy_in_hand,
} from "@/logic/player_move/passive_abilities/passives_card/spawn_enemy"
import { spawn_random_in_hand } from "@/logic/player_move/passive_abilities/passives_card/spawn_random_in_hand"
import { add_charges_if_playing_d_all } from "@/logic/player_move/passive_abilities/passives_leader/add-charges-if-playing-d-all"
import type { Card, GameObj } from "@/types"
import { CardPassiveAbility } from "@/types"

export type PassiveLocation = "hand" | "deck" | "grave"

export function run_passive(
  card: Card,
  gameObj: GameObj,
  location: PassiveLocation,
  timeout = 1000
): void {
  if (!allowActionTimer(card)) return

  if (location === "deck")
    timeoutAnimationFlag(card, "trigger_deck_passive", null, timeout * 0.5)
  else if (location === "grave")
    timeoutAnimationFlag(card, "trigger_grave_passive", null, timeout * 0.5)

  const fromHand = location === "hand"
  const pa = card?.passive_ability?.name

  if (pa === CardPassiveAbility.DamageRandomEnemy) {
    damage_random_enemy(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.IncrDmgTo) {
    incr_dmg_to_random(card, gameObj, location, !fromHand, timeout)
  } else if (pa === CardPassiveAbility.HealLeader) {
    heal_leader(card, timeout)
  } else if (pa === CardPassiveAbility.IncrSelfDmg) {
    incr_self_dmg(card, !fromHand, timeout)
  } else if (pa === CardPassiveAbility.DestroyTwoEnemies) {
    destroy_2_enemies(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.AddChargesToLeaderIfPlayDAll) {
    add_charges_if_playing_d_all(card, gameObj.leader, false)
  } else if (pa === CardPassiveAbility.SetDmgAsRandomEnemyGrave) {
    set_dmg_as_random_enemy_grave(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.IncrDmgByNEnemiesGrave) {
    incr_dmg_by_n_enemies_grave(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.IncrDmgByLenDeck) {
    incr_dmg_by_len_deck(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.SpawnRandomInHand) {
    spawn_random_in_hand(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.IncrDmgByNGrave) {
    inc_dmg_by_len_grave(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.PoisonRandom) {
    poison_random_enemy_passive(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.PoisonAll) {
    poison_all_enemies_passive(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.AddArmor) {
    add_armor_passive(card, timeout)
  } else if (pa === CardPassiveAbility.SpawnRandomEnemyInHand) {
    spawn_random_enemy_in_hand(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.PassiveLock) {
    lock_random(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.DestroyWithPassive) {
    destroy_with_passive(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.DestroyWithStatus) {
    passive_destroy_with_status(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.RemovePassive) {
    remove_passive(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.SpawnRandomEnemyInDeck) {
    spawn_random_enemy_in_deck(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.RemoveDeathwish) {
    remove_deathwish(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.RemoveShield) {
    remove_shield(card, gameObj, timeout)
  } else if (pa === CardPassiveAbility.SpawnEffect) {
    spawn_effect(card, gameObj)
  } else if (pa === CardPassiveAbility.SpawnEffectRandom) {
    spawn_effect_random(card, gameObj)
  } else if (pa === CardPassiveAbility.IncrEffect) {
    incr_effect(card, gameObj)
  } else if (pa === CardPassiveAbility.RemoveEffect) {
    remove_effect(gameObj)
  } else if (pa === CardPassiveAbility.RemoveArmor) {
    remove_random_enemy_armor(card, gameObj)
  } else if (pa === CardPassiveAbility.DestroyWithArmor) {
    destroy_random_enemy_with_armor(gameObj, timeout)
  } else if (pa === CardPassiveAbility.DrainEnemyArmor) {
    const armorValueDrained = remove_random_enemy_armor(card, gameObj)
    if (armorValueDrained > 0) add_armor(armorValueDrained, timeout)
  } else if (pa === CardPassiveAbility.IfInGraveSpawnSelfInEnemyGrave) {
    if_in_grave_spawn_self_in_enemy_grave(card, gameObj, timeout)
  }
}
