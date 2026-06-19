import { useToast } from "vue-toastification"

import type {
  ActionContext,
  DeckCardEntry,
  DeckEntry,
  Enemy,
  EnemyLeader,
  Leader,
  MappedLevel,
  MappedSeason,
  MappedUserLevel,
} from "@/types"

const toast = useToast()

export interface GameState {
  // параметры из UpgradesConfig[UpgradeType.GAME]
  cards_in_deck: number
  hand_size: number
  max_decks: number
  max_hp: number
  max_armor: number
  first_aid_kit_heal: number
  shield_armor: number
  draws_initial: number
  draws_after_redraw: number
  cards_drawn: number
  max_immune_turns: number
  immune_magics_turns: number

  arena_mode: boolean

  random_level_enemies_count: Record<string, unknown>
  max_random_n_enemies: number

  whole_deck: DeckEntry | Record<string, never>
  current_deck: DeckCardEntry[]
  current_deck_index: number | undefined
  current_deck_id: number | undefined
  health: number
  armor: number
  armor_delta: number | null
  leader: Leader | undefined | null

  whole_level: MappedUserLevel | Record<string, never>
  level: MappedLevel | null
  season: MappedSeason | null
  enemy_leader: EnemyLeader | undefined | null

  enemies_grave: Enemy[]

  ppa_end_turn: boolean
  ai_move: boolean
  epa_end_turn: boolean
  player_turn: boolean

  start_game_redirect: boolean

  max_hp_shown: boolean
  max_armor_shown: boolean
  max_immune_shown: boolean

  // Лог атак врагов на игрока за текущий интервал между sendGameState.
  // Каждая запись — значение damage одного вызова damage_player.
  // Используется в мультиплеере, чтобы игрок 2 применял каждую атаку
  // через свою броню, а не получал суммарную дельту HP напрямую.
  attack_log: number[]

  // Количество ходов неуязвимости: 0 = нет, >0 = активна.
  // Пока >0 — damage_player не наносит урон и не тратит броню.
  invulnerability: number
  // Флаг "попали по неуязвимому": true на короткое время → анимация в HealthComp.
  invulnerability_hit: boolean
}

interface GameActionContext extends ActionContext {
  state: GameState
}

const state: GameState = {
  cards_in_deck: 10,
  hand_size: 5,
  max_decks: 2,
  max_hp: 100,
  max_armor: 0,
  first_aid_kit_heal: 0,
  shield_armor: 0,
  draws_initial: 1,
  draws_after_redraw: 0,
  cards_drawn: 1,
  max_immune_turns: 0,
  immune_magics_turns: 0,

  random_level_enemies_count: {},
  max_random_n_enemies: 0,

  whole_deck: {},
  current_deck: [],
  current_deck_index: undefined,
  current_deck_id: undefined,
  health: 0,
  armor: 0,
  armor_delta: null,
  leader: null,

  whole_level: {},
  level: null,
  season: null,
  enemy_leader: null,

  enemies_grave: [],

  ppa_end_turn: false,
  ai_move: false,
  epa_end_turn: false,
  player_turn: true,

  start_game_redirect: false,

  arena_mode: false,

  max_hp_shown: false,
  max_armor_shown: false,
  max_immune_shown: false,

  attack_log: [],

  invulnerability: 0,
  invulnerability_hit: false,
}

const getters = {
  // параметры для игры, которые берутся из апгрейдов
  maxCardsInDeck: (state: GameState, _getters: any, rootState: any) => {
    if (state.arena_mode) {
      const userLevel =
        rootState.arena?.user_upgrades?.["max_cards_in_deck"] ?? 0
      return (
        rootState.arena?.arenaUpgrades?.upgrades?.["max_cards_in_deck"]
          ?.upgrades?.[userLevel]?.value ?? state.cards_in_deck
      )
    }
    return state.cards_in_deck
  },
  handSize: (state: GameState, _getters: any, rootState: any) => {
    if (state.arena_mode) {
      const userLevel = rootState.arena?.user_upgrades?.["hand_size"] ?? 0
      return (
        rootState.arena?.arenaUpgrades?.upgrades?.["hand_size"]?.upgrades?.[
          userLevel
        ]?.value ?? state.hand_size
      )
    }
    return state.hand_size
  },
  maxDecks: (state: GameState) => state.max_decks,
  maxHp: (state: GameState) => state.max_hp,
  maxArmor: (state: GameState) => state.max_armor,
  maxImmuneTurns: (state: GameState) => state.max_immune_turns,

  get_season: (state: GameState) => state.season,
  currentLevel: (state: GameState) => state.level,
  enemies_grave: (state: GameState) => state.enemies_grave,
}

const mutations = {
  setUpgradesConst(
    state: GameState,
    payload: {
      hand_size?: number
      number_of_cards_in_deck?: number
      max_decks?: number
      max_hp?: number
      max_armor?: number
      first_aid_kit_heal?: number
      shield_armor?: number
      draws_initial: number
      draws_after_redraw: number
      cards_drawn: number
      max_immune_turns: number
      immune_magics_turns: number
    }
  ) {
    state.hand_size = payload.hand_size ?? state.hand_size
    state.cards_in_deck = payload.number_of_cards_in_deck ?? state.cards_in_deck
    state.max_decks = payload.max_decks ?? state.max_decks
    state.max_hp = payload.max_hp ?? state.max_hp
    state.max_armor = payload.max_armor ?? state.max_armor
    state.first_aid_kit_heal =
      payload.first_aid_kit_heal ?? state.first_aid_kit_heal
    state.shield_armor = payload.shield_armor ?? state.shield_armor
    state.draws_initial = payload.draws_initial ?? state.draws_initial
    state.draws_after_redraw =
      payload.draws_after_redraw ?? state.draws_after_redraw
    state.cards_drawn = payload.cards_drawn ?? state.cards_drawn
    state.max_immune_turns = payload.max_immune_turns ?? state.max_immune_turns
    state.immune_magics_turns =
      payload.immune_magics_turns ?? state.immune_magics_turns
  },

  set_game_const(
    state: GameState,
    payload: {
      random_level_enemies_count?: Record<string, unknown>
      max_random_n_enemies?: number
    }
  ) {
    state.random_level_enemies_count =
      payload.random_level_enemies_count ?? state.random_level_enemies_count
    state.max_random_n_enemies =
      payload.max_random_n_enemies ?? state.max_random_n_enemies ?? 55
  },
  set_whole_deck(state: GameState, deck: DeckEntry) {
    state.whole_deck = deck
  },
  set_current_deck(state: GameState, deck: DeckCardEntry[]) {
    state.current_deck = deck
  },
  set_current_deck_index(state: GameState, index: number) {
    state.current_deck_index = index
  },
  set_current_deck_id(state: GameState, id: number) {
    state.current_deck_id = id
  },
  set_health(state: GameState, param: number) {
    // максимальные жизни колоды теперь ограничены апгрейдом
    if (param > state.max_hp) {
      if (!state.max_hp_shown) {
        toast.info(
          "Максимальный уровень здоровья достигнут. Увеличьте его в разделе Прокачка"
        )
        state.max_hp_shown = true
      }
      param = state.max_hp
    }
    state.health = param
  },
  set_leader(state: GameState, leader: Leader | undefined) {
    state.leader = leader
  },

  set_season(state: GameState, season: MappedSeason) {
    state.season = season
  },
  set_level(state: GameState, level: MappedUserLevel) {
    state.level = level.level
    state.whole_level = level
  },
  set_enemy_leader(state: GameState, enemy_leader: EnemyLeader | undefined) {
    state.enemy_leader = enemy_leader
  },

  change_health(state: GameState, param: number) {
    state.health += param
    // максимальные жизни колоды теперь ограничены апгрейдом
    if (state.health > state.max_hp) {
      if (!state.max_hp_shown) {
        toast.info(
          "Максимальный уровень здоровья достигнут. Увеличьте его в разделе Прокачка"
        )
        state.max_hp_shown = true
      }
      state.health = state.max_hp
    }
  },
  change_armor(state: GameState, armor_delta: number) {
    state.armor += armor_delta
    // максимальные броня теперь ограничена апгрейдом
    if (state.armor > state.max_armor) {
      if (!state.max_armor_shown) {
        toast.info(
          "Максимальный уровень брони достигнут. Увеличьте его в разделе Прокачка"
        )
        state.max_armor_shown = true
      }
      state.armor = state.max_armor
    }
  },
  set_armor(state: GameState, armor_value: number) {
    // максимальные броня теперь ограничена апгрейдом
    if (armor_value > state.max_armor) {
      if (!state.max_armor_shown) {
        toast.info(
          "Максимальный уровень брони достигнут. Увеличьте его в разделе Прокачка"
        )
        state.max_armor_shown = true
      }
      armor_value = state.max_armor
    }
    state.armor = armor_value
  },
  set_armor_delta(state: GameState, armor_delta: number | null) {
    state.armor_delta = armor_delta
  },

  log_player_attack(state: GameState, damage: number) {
    state.attack_log.push(damage)
  },
  clear_attack_log(state: GameState) {
    state.attack_log = []
  },

  set_invulnerability(state: GameState, value: number) {
    if (value > state.max_immune_turns) {
      if (!state.max_immune_shown) {
        toast.info(
          "Максимальный уровень неуязвимости достигнут. Увеличьте его в разделе Прокачка"
        )
        state.max_immune_shown = true
      }
      value = state.max_immune_turns
    }
    state.invulnerability = value
  },
  set_invulnerability_hit(state: GameState, value: boolean) {
    state.invulnerability_hit = value
  },

  set_ppa_end_turn(state: GameState, payload: boolean) {
    state.ppa_end_turn = payload
  },
  set_ai_move(state: GameState, payload: boolean) {
    state.ai_move = payload
  },
  set_epa_end_turn(state: GameState, payload: boolean) {
    state.epa_end_turn = payload
  },
  set_player_turn(state: GameState, payload: boolean) {
    state.player_turn = payload
  },

  set_start_game_redirect(state: GameState, payload: boolean) {
    state.start_game_redirect = payload
  },
  set_enemies_grave(state: GameState, enemies_grave: Enemy[]) {
    state.enemies_grave = enemies_grave
  },

  set_arena_mode(state: GameState, payload: boolean) {
    state.arena_mode = payload
  },
}

const actions = {
  sync_arena_game_params({ commit, getters }: ActionContext) {
    const arenaUpgrades = getters["arena_upgrades_config"]
    const userUpgrades: Record<string, number> =
      getters["arena_user_upgrades"] ?? {}

    const arenaValue = (key: string, fallback: number): number => {
      const level = userUpgrades[key] ?? 0
      return (
        arenaUpgrades?.upgrades?.[key]?.upgrades?.[level]?.value ?? fallback
      )
    }

    commit("setUpgradesConst", {
      max_hp: arenaValue("max_hp", getters["maxHp"]),
      max_armor: arenaValue("max_armor", getters["maxArmor"]),
    })
  },

  set_deck_in_play(
    { commit, getters }: ActionContext,
    deck: DeckEntry | null = null
  ) {
    let index: number | undefined = undefined
    if (deck) {
      index = getters["all_decks"].findIndex(
        (d: DeckEntry) => d.id === deck!.id
      )
    } else {
      deck = getters["all_decks"].at(-1)
      index = getters["all_decks"].length - 1
    }
    if (!deck) return
    commit("set_current_deck", deck.deck.cards)
    commit("set_current_deck_index", index)
    commit("set_current_deck_id", deck.id)
    commit("set_health", deck.deck.health)
    commit("set_leader", deck.deck.leader)
    commit("set_whole_deck", deck)
  },
  set_level_in_play({ commit }: ActionContext, level: MappedUserLevel) {
    commit("set_level", level)
    commit("set_enemy_leader", level.level.enemy_leader)
  },
  re_set_deck({ state, getters, dispatch }: GameActionContext, timeout = 3000) {
    const deck: DeckEntry =
      getters["all_decks"][state.current_deck_index as number]
    if (!deck) return
    setTimeout(() => {
      dispatch("set_deck_in_play", deck)
      console.log("переустановка колоды!")
    }, timeout)
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
