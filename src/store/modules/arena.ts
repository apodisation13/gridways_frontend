import type { DeckCardEntry, Leader, MappedUserLevel } from "@/types"
import type { UpgradeCategory } from "@/types/upgrades"

export interface ArenaState {
  base_enemies: number
  delta_enemies: number
  current_level: number
  current_enemies: number
  is_active: boolean
  deck: DeckCardEntry[]
  leader: Leader | null
  health: number
  armor: number
  level: MappedUserLevel | null
  arenaUpgrades: UpgradeCategory | null
}

const state: ArenaState = {
  base_enemies: 10,
  delta_enemies: 5,
  current_level: 1,
  current_enemies: 10,
  is_active: false,
  deck: [],
  leader: null,
  health: 0,
  armor: 0,
  level: null,
  arenaUpgrades: null,
}

const getters = {
  arena_is_active: (state: ArenaState) => state.is_active,
  arena_current_level: (state: ArenaState) => state.current_level,
  arena_current_enemies: (state: ArenaState) => state.current_enemies,
  arena_deck: (state: ArenaState) => state.deck,
  arena_leader: (state: ArenaState) => state.leader,
  arena_health: (state: ArenaState) => state.health,
  arena_armor: (state: ArenaState) => state.armor,
  arena_level: (state: ArenaState) => state.level,
  arena_upgrades_config: (state: ArenaState) => state.arenaUpgrades,
}

const mutations = {
  arena_set_active(state: ArenaState, value: boolean) {
    state.is_active = value
  },
  arena_set_deck_complete(
    state: ArenaState,
    payload: { deck: DeckCardEntry[]; leader: Leader }
  ) {
    state.deck = payload.deck
    state.leader = payload.leader
    state.health =
      payload.deck.reduce((acc, c) => acc + (c.card?.data.hp ?? 0), 0) +
      (payload.leader?.data.hp ?? 0)
  },
  arena_set_level(state: ArenaState, level: MappedUserLevel) {
    state.level = level
  },
  arena_advance_level(state: ArenaState) {
    state.current_level += 1
    state.current_enemies += state.delta_enemies
    state.level = null
  },
  arena_reset(state: ArenaState) {
    state.is_active = false
    state.current_level = 1
    state.current_enemies = state.base_enemies
    state.deck = []
    state.leader = null
    state.health = 0
    state.armor = 0
    state.level = null
  },
  setArenaUpgrades(state: ArenaState, payload: UpgradeCategory) {
    state.arenaUpgrades = payload
  },
}

export default { state, getters, mutations }
