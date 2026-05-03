import { allowActionTimer } from "@/logic/game_logic/timers"
import { add_armor_passive } from "@/logic/player_move/passive_abilities/passives_in_hand/armor"
import { damage_random_enemy } from "@/logic/player_move/passive_abilities/passives_in_hand/damage_random_enemy"
import { destroy_2_enemies } from "@/logic/player_move/passive_abilities/passives_in_hand/destroy_2_enemies"
import { heal_leader } from "@/logic/player_move/passive_abilities/passives_in_hand/heal_leader"
import {
  inc_dmg_by_len_grave,
  incr_dmg_by_len_deck,
  incr_dmg_by_n_enemies_grave,
  incr_dmg_to_random,
  incr_self_dmg,
} from "@/logic/player_move/passive_abilities/passives_in_hand/incr_dmg"
import {
  poison_all_enemies_passive,
  poison_random_enemy_passive,
} from "@/logic/player_move/passive_abilities/passives_in_hand/poison"
import { set_dmg_as_random_enemy_grave } from "@/logic/player_move/passive_abilities/passives_in_hand/set_dmg_as_random_enemy_grave"
import { spawn_random_in_hand } from "@/logic/player_move/passive_abilities/passives_in_hand/spawn_random_in_hand"
import { add_charges_if_playing_d_all } from "@/logic/player_move/passive_abilities/passives_leader/add-charges-if-playing-d-all"
import type { Card, GameObj } from "@/types"

export function hand_passives(
  card: Card,
  gameObj: GameObj,
  timeout = 1000
): void {
  if (!allowActionTimer(card)) return

  // ДИСПЕТЧЕР ПАССИВНЫХ АБИЛОК В РУКЕ!
  const pa = card.passive_ability.name
  if (pa === "damage-random-enemy") {
    damage_random_enemy(card, gameObj, timeout)
  } else if (pa === "incr-dmg-to") {
    incr_dmg_to_random(card, gameObj, "hand", false, timeout)
  } else if (pa === "heal-leader") {
    heal_leader(card, timeout)
  } else if (pa === "incr-self-dmg") {
    incr_self_dmg(card, false, timeout)
  } else if (pa === "destroy-2-enemies") {
    destroy_2_enemies(card, gameObj, timeout)
  } else if (pa === "add-charges-to-leader-if-play-d-all") {
    add_charges_if_playing_d_all(card, gameObj.leader, false)
  } else if (pa === "set-dmg-as-random-enemy-grave") {
    set_dmg_as_random_enemy_grave(card, gameObj, timeout)
  } else if (pa === "incr-dmg-by-n-enemies-grave") {
    incr_dmg_by_n_enemies_grave(card, gameObj, timeout)
  } else if (pa === "incr-dmg-by-len-deck") {
    incr_dmg_by_len_deck(card, gameObj, timeout)
  } else if (pa === "spawn-random-in-hand") {
    spawn_random_in_hand(card, gameObj, timeout)
  } else if (pa === "incr-dmg-by-n-grave") {
    inc_dmg_by_len_grave(card, gameObj, timeout)
  } else if (pa === "poison-random") {
    poison_random_enemy_passive(card, gameObj, timeout)
  } else if (pa === "poison-all") {
    poison_all_enemies_passive(card, gameObj, timeout)
  } else if (pa === "add-armor") {
    add_armor_passive(card, timeout)
  }
}
