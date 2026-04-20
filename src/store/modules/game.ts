import type {
  Leader,
  Enemy,
  EnemyLeader,
  DeckEntry,
  DeckCardEntry,
  MappedLevel,
  MappedUserLevel,
  MappedSeason,
  ActionContext,
} from "@/types"

interface GameState {
  cards_in_deck: number | undefined
  hand_size: number | undefined

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
}

interface GameActionContext extends ActionContext {
  state: GameState
}

const state: GameState = {
  cards_in_deck: undefined,
  hand_size: undefined,

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
}

const getters = {
  get_season: (state: GameState) => state.season,
  currentLevel: (state: GameState) => state.level,
  enemies_grave: (state: GameState) => state.enemies_grave,
}

const mutations = {
  set_game_const(
    state: GameState,
    payload: {
      hand_size: number
      number_of_cards_in_deck: number
      random_level_enemies_count: Record<string, unknown>
      max_random_n_enemies?: number
    }
  ) {
    state.hand_size = payload.hand_size
    state.cards_in_deck = payload.number_of_cards_in_deck
    state.random_level_enemies_count = payload.random_level_enemies_count
    state.max_random_n_enemies = payload.max_random_n_enemies ?? 55
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
  },
  change_armor(state: GameState, armor_delta: number) {
    state.armor += armor_delta
  },
  set_armor(state: GameState, armor_value: number) {
    state.armor = armor_value
  },
  set_armor_delta(state: GameState, armor_delta: number | null) {
    state.armor_delta = armor_delta
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
}

const actions = {
  set_deck_in_play(
    { commit, getters }: ActionContext,
    deck: DeckEntry | null = null
  ) {
    let index: number | undefined = undefined
    if (deck) {
      index = getters["all_decks"].findIndex((d: DeckEntry) => d.id === deck.id)
    }
    if (!deck) {
      deck = getters["all_decks"].at(-1)
      index = getters["all_decks"].length - 1
    }
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
