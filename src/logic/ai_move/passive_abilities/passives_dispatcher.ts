import {
  add_armor_all,
  add_armor_self,
  add_armor_to_leader,
  add_armor_to_random_enemy,
  heal_self_by_armor,
  lose_armor,
  transform_armor_to_health,
} from "@/logic/ai_move/passive_abilities/passives/armor_passives"
import { decrease_player_damage } from "@/logic/ai_move/passive_abilities/passives/decrease_player_damage"
import {
  decr_effect,
  incr_effect,
  remove_effect,
  spawn_effect,
  spawn_effect_random,
} from "@/logic/ai_move/passive_abilities/passives/effects_passives"
import {
  heal_all,
  heal_column,
  heal_enemy_leader,
  heal_random,
  heal_row,
  heal_self,
  heal_self_by_highest_hp,
} from "@/logic/ai_move/passive_abilities/passives/heal"
import {
  incr_dmg_column,
  incr_dmg_row,
  incr_random_dmg,
  incr_self_dmg,
} from "@/logic/ai_move/passive_abilities/passives/increase_damage"
import {
  give_shield,
  regain_shield,
} from "@/logic/ai_move/passive_abilities/passives/regain_shield"
import { resurrect_random_bronze } from "@/logic/ai_move/passive_abilities/passives/resurrects"
import { set_dmg_as_highest_hand } from "@/logic/ai_move/passive_abilities/passives/set_dmg_as_highest_hand"
import { set_dmg_random_grave } from "@/logic/ai_move/passive_abilities/passives/set_dmg_random_grave"
import { set_hp_random_grave } from "@/logic/ai_move/passive_abilities/passives/set_hp_random_grave"
import {
  spawn_faction_unit,
  spawn_random_token,
  spawn_self_at_deck,
  spawn_token,
  spawn_tokens_in_deck,
} from "@/logic/ai_move/passive_abilities/passives/spawns"
import { give_random_veil } from "@/logic/ai_move/passive_abilities/passives/statuses"
import type { Enemy, GameObj } from "@/types"
import { EnemyPassive } from "@/types"

export function run_passive(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  const { enemy_leader, field, hand } = gameObj
  const pea = enemy.passive_ability?.name

  if (pea === EnemyPassive.IncrSelfDmg) {
    incr_self_dmg(enemy, timeout)
  } else if (pea === EnemyPassive.HealSelf) {
    heal_self(enemy, timeout)
  } else if (pea === EnemyPassive.HealLeader) {
    heal_enemy_leader(enemy, enemy_leader, timeout)
  } else if (pea === EnemyPassive.RegainShield) {
    regain_shield(enemy)
  } else if (pea === EnemyPassive.HealAll) {
    heal_all(enemy, field, enemy_leader, timeout)
  } else if (pea === EnemyPassive.HealRandom) {
    heal_random(enemy, field, enemy_leader, timeout)
  } else if (pea === EnemyPassive.IncrRandomDmg) {
    incr_random_dmg(enemy, field, timeout)
  } else if (pea === EnemyPassive.DecrPlayerDmg) {
    decrease_player_damage(enemy.data?.passive?.value || 0, hand, timeout)
  } else if (pea === EnemyPassive.SetHpRandomGrave) {
    set_hp_random_grave(enemy, gameObj, timeout)
  } else if (pea === EnemyPassive.SetDmgAsHighestHand) {
    set_dmg_as_highest_hand(enemy, gameObj, timeout)
  } else if (pea === EnemyPassive.SetDmgRandomGrave) {
    set_dmg_random_grave(enemy, gameObj, timeout)
  } else if (pea === EnemyPassive.HealSelfByHighestHp) {
    heal_self_by_highest_hp(enemy, field, enemy_leader, timeout)
  } else if (pea === EnemyPassive.HealRow) {
    heal_row(enemy, field, timeout)
  } else if (pea === EnemyPassive.HealColumn) {
    heal_column(enemy, field, timeout)
  } else if (pea === EnemyPassive.IncrDmgRow) {
    incr_dmg_row(enemy, field, timeout)
  } else if (pea === EnemyPassive.IncrDmgColumn) {
    incr_dmg_column(enemy, field, timeout)
  } else if (pea === EnemyPassive.SpawnSelfInDeck) {
    spawn_self_at_deck(enemy, gameObj, timeout)
  } else if (pea === EnemyPassive.SpawnTokensInDeck) {
    spawn_tokens_in_deck(enemy, gameObj, timeout)
  } else if (pea === EnemyPassive.SpawnToken) {
    spawn_token(enemy, gameObj, timeout)
  } else if (pea === EnemyPassive.SpawnRandomToken) {
    spawn_random_token(enemy, gameObj, timeout)
  } else if (pea === EnemyPassive.GiveShield) {
    give_shield(field, enemy_leader)
  } else if (pea === EnemyPassive.SpawnFactionUnit) {
    spawn_faction_unit(enemy, gameObj, true, timeout)
  } else if (pea === EnemyPassive.SpawnEffectRandom) {
    spawn_effect_random(enemy, gameObj)
  } else if (pea === EnemyPassive.SpawnEffect) {
    spawn_effect(enemy, gameObj)
  } else if (pea === EnemyPassive.DecreaseEffect) {
    decr_effect(enemy, gameObj)
  } else if (pea === EnemyPassive.RemoveEffect) {
    remove_effect(gameObj)
  } else if (pea === EnemyPassive.ResurrectRandomBronze) {
    resurrect_random_bronze(gameObj, timeout)
  } else if (pea === EnemyPassive.GiveVeil) {
    give_random_veil(gameObj)
  } else if (pea === EnemyPassive.IncreaseEffect) {
    incr_effect(enemy, gameObj)
  } else if (pea === EnemyPassive.AddArmorSelf) {
    add_armor_self(enemy)
  } else if (pea === EnemyPassive.AddArmorRandomField) {
    add_armor_to_random_enemy(enemy, gameObj, "field")
  } else if (pea === EnemyPassive.HealByArmor) {
    heal_self_by_armor(enemy)
  } else if (pea === EnemyPassive.TransformArmorToHealth) {
    transform_armor_to_health(enemy, gameObj, timeout)
  } else if (pea === EnemyPassive.AddArmorRandomGrave) {
    add_armor_to_random_enemy(enemy, gameObj, "grave")
  } else if (pea === EnemyPassive.AddArmorRandomDeck) {
    add_armor_to_random_enemy(enemy, gameObj, "deck")
  } else if (pea === EnemyPassive.AddArmorAll) {
    add_armor_all(enemy, gameObj)
  } else if (pea === EnemyPassive.AddArmorToLeader) {
    add_armor_to_leader(enemy, gameObj)
  } else if (pea === EnemyPassive.LoseArmor) {
    lose_armor(enemy)
  }
}
