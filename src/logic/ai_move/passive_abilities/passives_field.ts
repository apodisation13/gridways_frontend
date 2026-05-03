import { decrease_player_damage } from "@/logic/ai_move/passive_abilities/passives_in_field/decrease_player_damage"
import {
  heal_all,
  heal_column,
  heal_enemy_leader,
  heal_random,
  heal_row,
  heal_self,
  heal_self_by_highest_hp,
} from "@/logic/ai_move/passive_abilities/passives_in_field/heal"
import {
  incr_dmg_column,
  incr_dmg_row,
  incr_random_dmg,
  incr_self_dmg,
} from "@/logic/ai_move/passive_abilities/passives_in_field/increase_damage"
import {
  give_shield,
  regain_shield,
} from "@/logic/ai_move/passive_abilities/passives_in_field/regain_shield"
import { set_dmg_as_highest_hand } from "@/logic/ai_move/passive_abilities/passives_in_field/set_dmg_as_highest_hand"
import { set_dmg_random_grave } from "@/logic/ai_move/passive_abilities/passives_in_field/set_dmg_random_grave"
import { set_hp_random_grave } from "@/logic/ai_move/passive_abilities/passives_in_field/set_hp_random_grave"
import {
  spawn_faction_unit,
  spawn_random_token,
  spawn_self_at_deck,
  spawn_token,
  spawn_tokens_in_deck,
} from "@/logic/ai_move/passive_abilities/passives_in_field/spawns"
import { allowActionTimer } from "@/logic/game_logic/timers"
import type { Enemy, GameObj } from "@/types"

export function field_passives(
  enemy: Enemy,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(enemy)) return

  const { enemy_leader, field, hand } = gameObj
  const pea = enemy.passive_ability?.name

  if (pea === "incr-self-dmg") {
    incr_self_dmg(enemy, timeout)
  } else if (pea === "heal-self") {
    heal_self(enemy, timeout)
  } else if (pea === "heal-leader") {
    heal_enemy_leader(enemy, enemy_leader, timeout)
  } else if (pea === "regain-shield") {
    regain_shield(enemy)
  } else if (pea === "heal-all") {
    heal_all(enemy, field, enemy_leader, timeout)
  } else if (pea === "heal-random") {
    heal_random(enemy, field, enemy_leader, timeout)
  } else if (pea === "incr-random-dmg") {
    incr_random_dmg(enemy, field, timeout)
  } else if (pea === "decr-player-dmg") {
    decrease_player_damage(enemy, hand, timeout)
  } else if (pea === "set-hp-random-grave") {
    set_hp_random_grave(enemy, gameObj, timeout)
  } else if (pea === "set-dmg-as-highest-hand") {
    set_dmg_as_highest_hand(enemy, gameObj, timeout)
  } else if (pea === "set-dmg-random-grave") {
    set_dmg_random_grave(enemy, gameObj, timeout)
  } else if (pea === "heal-self-by-highest-hp") {
    heal_self_by_highest_hp(enemy, field, enemy_leader, timeout)
  } else if (pea === "heal-row") {
    heal_row(enemy, field, timeout)
  } else if (pea === "heal-column") {
    heal_column(enemy, field, timeout)
  } else if (pea === "incr-dmg-row") {
    incr_dmg_row(enemy, field, timeout)
  } else if (pea === "incr-dmg-column") {
    incr_dmg_column(enemy, field, timeout)
  } else if (pea === "spawn-self-in-deck") {
    spawn_self_at_deck(enemy, gameObj, timeout)
  } else if (pea === "spawn-tokens-in-deck") {
    spawn_tokens_in_deck(enemy, gameObj, timeout)
  } else if (pea === "spawn-token") {
    spawn_token(enemy, field, timeout)
  } else if (pea === "spawn-random-token") {
    spawn_random_token(enemy, gameObj, timeout)
  } else if (pea === "give-shield") {
    give_shield(field, enemy_leader)
  } else if (pea === "spawn-faction-unit") {
    spawn_faction_unit(enemy, gameObj, true, timeout)
  }
}
