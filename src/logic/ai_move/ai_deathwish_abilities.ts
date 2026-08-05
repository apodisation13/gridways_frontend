import { destroy_player_card_in_deck } from "@/logic/ai_move/deathwish_abilities/destroy_player_card"
import {
  give_shield_to_all_deck,
  give_shields_to_all,
} from "@/logic/ai_move/deathwish_abilities/give_shields"
import { deathwish_heal_all } from "@/logic/ai_move/deathwish_abilities/heal"
import { deathwish_incr_dmg_to_all_hand } from "@/logic/ai_move/deathwish_abilities/incr_dmg_to_all_hand"
import {
  set_hp,
  set_weakest_hp_as_highest,
} from "@/logic/ai_move/deathwish_abilities/set_hp"
import {
  spawn_self,
  spawn_self_at_deck,
  spawn_self_at_grave,
} from "@/logic/ai_move/deathwish_abilities/spawn_self"
import {
  spawn_tokens,
  spawn_tokens_at_deck,
} from "@/logic/ai_move/deathwish_abilities/spawn_tokens"
import {
  spawn_faction_unit,
  spawn_faction_unit_at_deck,
} from "@/logic/ai_move/passive_abilities/passives_in_field/spawns"
import { sound_deathwish } from "@/logic/play_sounds"
import type { Enemy, EnemyLeader, GameObj } from "@/types"
import { EnemyDeathwish } from "@/types"

// ДИСПЕТЧЕР абилок deathwish у врага
export function deathwish(
  deathwish_enemy: Enemy | EnemyLeader,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!deathwish_enemy) return

  const d = deathwish_enemy.deathwish?.name
  if (d === EnemyDeathwish.SpawnSelf)
    spawn_self(deathwish_enemy as Enemy, gameObj, timeout)
  else if (d === EnemyDeathwish.SpawnTokens)
    spawn_tokens(deathwish_enemy as Enemy, gameObj, timeout)
  else if (d === EnemyDeathwish.IncrDmgToHandByValue) {
    deathwish_incr_dmg_to_all_hand(deathwish_enemy as Enemy, gameObj, timeout)
  } else if (d === EnemyDeathwish.HealAll)
    deathwish_heal_all(deathwish_enemy as Enemy, gameObj, timeout)
  else if (d === EnemyDeathwish.SpawnSelfAtDeck) {
    spawn_self_at_deck(deathwish_enemy as Enemy, gameObj, timeout)
  } else if (d === EnemyDeathwish.DestroyRandomCardInPlayerDeck) {
    destroy_player_card_in_deck(gameObj)
  } else if (d === EnemyDeathwish.SetHp) {
    set_hp(deathwish_enemy as Enemy)
  } else if (d === EnemyDeathwish.SpawnTokensAtDeck) {
    spawn_tokens_at_deck(deathwish_enemy as Enemy, gameObj, timeout)
  } else if (d === EnemyDeathwish.SpawnSelfAtGrave) {
    spawn_self_at_grave(deathwish_enemy as Enemy, gameObj, timeout)
  } else if (d === EnemyDeathwish.GiveShieldsToAll) {
    give_shields_to_all(gameObj)
  } else if (d === EnemyDeathwish.GiveShieldsToAllDeck) {
    give_shield_to_all_deck(gameObj, timeout)
  } else if (d === EnemyDeathwish.SetWeakestHpAsHighest) {
    set_weakest_hp_as_highest(gameObj, timeout)
  } else if (d === EnemyDeathwish.SpawnFactionUnit) {
    sound_deathwish()
    spawn_faction_unit(deathwish_enemy as Enemy, gameObj, true, timeout) // а вот это из пассивок! один в один
  } else if (d === EnemyDeathwish.SpawnFactionUnitAtDeck) {
    sound_deathwish()
    spawn_faction_unit_at_deck(deathwish_enemy as Enemy, gameObj, timeout) // а вот это из пассивок! один в один
  } else if (d === EnemyDeathwish.SpawnUnit) {
    sound_deathwish()
    spawn_faction_unit(deathwish_enemy as Enemy, gameObj, false, timeout) // передаем false, чтобы взять вообще любого врага
  }
}
