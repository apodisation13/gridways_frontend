import store from "@/store"
import { CardAbility } from "@/types"
import type { Card, Leader, Enemy, EnemyLeader, GameObj } from "@/types"
import { hit_one_enemy } from "@/logic/player_move/abilities/hit_one_enemy"
import { heal } from "@/logic/player_move/abilities/ability_heal"
import { damage_one } from "@/logic/player_move/abilities/ability_damage_one"
import { damage_all } from "@/logic/player_move/abilities/ability_damage_all"
import { spread_damage } from "@/logic/player_move/abilities/ability_spread_damage"
import { damage_row } from "@/logic/player_move/abilities/ability_damage_row"
import { damage_column } from "@/logic/player_move/abilities/ability_damage_column"
import { destroy_highest_hp } from "@/logic/player_move/abilities/ability_destroy_highest_hp"
import { destroy_highest_damage } from "@/logic/player_move/abilities/ability_destroy_highest_damage"
import { destroy_random } from "@/logic/player_move/abilities/ability_destroy_random"
import { destroy_all_same_hp } from "@/logic/player_move/abilities/ability_destroy_all_same_hp"
import { lock_enemy } from "@/logic/player_move/abilities/ability_lock"
import { move_enemy } from "@/logic/player_move/abilities/ability_move_enemy"
import { check_win } from "@/logic/player_move/service/check_win"
import { player_passive_abilities_upon_playing_a_card } from "@/logic/player_move/player_passive_abilities_upon_playing_a_card"
import { set_enemy_as_token } from "@/logic/player_move/abilities/ability_set_enemy_as_token"
import { spawn_self_at_deck } from "@/logic/player_move/abilities/ability_spawn_self_at_deck"
import { spawn_self_at_grave } from "@/logic/player_move/abilities/ability_spawn_self_at_grave"
import { destroy_random_enemy_in_deck } from "@/logic/player_move/abilities/ability_destroy_random_enemy_in_deck"
import { place_self_in_field } from "@/logic/player_move/abilities/ability_place_self_in_field"
import { set_lowest_dmg_to_as_highest } from "@/logic/player_move/abilities/ability_set_lowest_dmg_to_as_highest"
import { spawn_tokens_at_enemy_deck } from "@/logic/player_move/abilities/ability_spawn_tokens_at_enemy_deck"
import { incr_dmg_to_all_hand } from "@/logic/player_move/abilities/ability_incr_dmg_to_all_hand"
import { incr_dmg_to_all_grave } from "@/logic/player_move/abilities/ability_incr_dmg_to_all_grave"
import { change_card_charges } from "@/logic/player_move/service/service_for_player_move"
import {
  poison_all_enemies,
  poison_one_enemy,
} from "@/logic/player_move/abilities/ability_poison"
import { add_armor } from "@/logic/player_move/abilities/ability_armor"
import { purify } from "@/logic/player_move/abilities/ability_purify"
import { give_charges_to_all } from "@/logic/player_move/abilities/ability_give_charges_to_all"

// Сюда заходим если там есть враг
// card - карта, которую мы играем (или из руки, или лидер).
// enemy - тот враг, в которого мы стреляем (или карта на поле, или лидер врагов).
export function damage_ai_card(
  card: Card | Leader,
  enemy: Enemy | EnemyLeader,
  gameObj: GameObj
): void {
  const { field, enemy_leader, enemies, leader, enemies_grave } = gameObj

  const ability = card?.ability?.name
  const timeout = store.getters["selectedMoveTimeout"]

  if (ability === CardAbility.Heal) {
    damage_one(enemy, card, gameObj, timeout)
    heal(card)
  } else if (ability === CardAbility.DamageAll) {
    damage_all(field, card, gameObj, timeout)
    if (enemy_leader.data.hp > 0)
      hit_one_enemy(enemy_leader, card, gameObj, timeout)
    setTimeout(
      () => check_win(field, enemies, enemy_leader, enemies_grave),
      timeout * 1.2
    )
  } else if (ability === CardAbility.SpreadDamage) {
    spread_damage(card, gameObj, timeout)
  } else if (ability === CardAbility.DamageRow) {
    damage_row(enemy, card, gameObj, timeout)
  } else if (ability === CardAbility.DamageColumn) {
    damage_column(enemy, card, gameObj, timeout)
  } else if (ability === CardAbility.DestroyHighestHp) {
    destroy_highest_hp(gameObj, timeout)
  } else if (ability === CardAbility.DestroyHighestDamage) {
    destroy_highest_damage(gameObj, timeout)
  } else if (ability === CardAbility.DestroyRandom) {
    destroy_random(gameObj, timeout)
  } else if (ability === CardAbility.DestroyAllSameHp) {
    destroy_all_same_hp(enemy, gameObj, timeout)
  } else if (ability === CardAbility.Lock) {
    lock_enemy(enemy)
    damage_one(enemy, card, gameObj, timeout)
  } else if (ability === CardAbility.MoveEnemy) {
    damage_one(enemy, card, gameObj, timeout)
    move_enemy(enemy, gameObj)
  } else if (ability === CardAbility.SetEnemyAsToken) {
    set_enemy_as_token(enemy as Enemy)
  } else if (ability === CardAbility.SpawnSelfAtDeck) {
    spawn_self_at_deck(card, gameObj, timeout)
    damage_one(enemy, card, gameObj, timeout)
  } else if (ability === CardAbility.SpawnSelfAtGrave) {
    spawn_self_at_grave(card, gameObj, timeout)
    damage_one(enemy, card, gameObj, timeout)
  } else if (ability === CardAbility.DestroyRandomEnemyInDeck) {
    destroy_random_enemy_in_deck(gameObj)
    damage_one(enemy, card, gameObj, timeout)
  } else if (ability === CardAbility.PlaceSelfInField) {
    place_self_in_field(card as Card, enemy as Enemy, gameObj)
  } else if (ability === CardAbility.SetLowestDmgToAsHighest) {
    set_lowest_dmg_to_as_highest(gameObj, timeout)
    damage_one(enemy, card, gameObj, timeout)
  } else if (ability === CardAbility.SpawnTokensAtEnemyDeck) {
    spawn_tokens_at_enemy_deck(card as Card, enemy, gameObj)
    damage_one(enemy, card, gameObj, timeout)
  } else if (ability === CardAbility.IncrDmgToAllHand) {
    damage_one(enemy, card, gameObj, timeout)
    incr_dmg_to_all_hand(card as Card, gameObj, timeout)
  } else if (ability === CardAbility.IncrDmgToAllGrave) {
    damage_one(enemy, card, gameObj, timeout)
    incr_dmg_to_all_grave(card as Card, gameObj, timeout)
  } else if (ability === CardAbility.Poison) {
    damage_one(enemy, card, gameObj, timeout)
    poison_one_enemy(enemy as Enemy, gameObj, timeout)
  } else if (ability === CardAbility.PoisonAll) {
    damage_one(enemy, card, gameObj, timeout)
    poison_all_enemies(gameObj, timeout)
  } else if (ability === CardAbility.AddArmor) {
    damage_one(enemy, card, gameObj, timeout)
    add_armor((card as Card).data.armor, timeout)
  } else if (ability === CardAbility.Purify) {
    purify(enemy)
    damage_one(enemy, card, gameObj, timeout)
  } else if (ability === CardAbility.GiveChargesToAll) {
    damage_one(enemy, card, gameObj, timeout)
    give_charges_to_all(card as Card, gameObj, timeout)
  } else damage_one(enemy, card, gameObj, timeout)

  // убираем карту игрока, если в ней не осталось зарядов, из руки и из колоды, если играли оттуда
  // чтобы анимация сброса корректно игралась, сброс карты происходит теперь не здесь,
  // а в special-case-abilities там где закрываем окно и в afterDamage (если не вызывалась sca)
  change_card_charges(card, -1, timeout)

  // пассивные абилки от хода
  player_passive_abilities_upon_playing_a_card(card, leader, enemy)
}
